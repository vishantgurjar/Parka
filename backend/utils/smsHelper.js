// Use native fetch (Node 18+) or fallback
const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;

/**
 * Send SMS OTP via Fast2SMS or Twilio API
 * @param {string} phone - Target phone number
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<{ success: boolean, provider?: string, error?: string }>}
 */
async function sendSmsOtp(phone, otpCode) {
  const cleanPhone = phone.replace(/\D/g, '');
  const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  // 1. Try Fast2SMS POST endpoint first
  if (fast2smsKey && typeof fetchFn === 'function') {
    try {
      const response = await fetchFn('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: cleanPhone
        })
      });
      const smsData = await response.json();
      if (smsData && (smsData.return || smsData.status_code === 200)) {
        console.log(`[SMS Helper] Fast2SMS OTP sent successfully to ${cleanPhone}`);
        return { success: true, provider: 'Fast2SMS' };
      }
      console.warn('[SMS Helper] Fast2SMS POST returned non-success:', smsData);
    } catch (err) {
      console.error('[SMS Helper] Fast2SMS POST Error:', err.message);
    }

    // Fast2SMS GET route fallback
    try {
      const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${otpCode}&numbers=${cleanPhone}`;
      const response = await fetchFn(getUrl);
      const smsData = await response.json();
      if (smsData && (smsData.return || smsData.status_code === 200)) {
        console.log(`[SMS Helper] Fast2SMS GET OTP sent successfully to ${cleanPhone}`);
        return { success: true, provider: 'Fast2SMS' };
      }
    } catch (getErr) {
      console.error('[SMS Helper] Fast2SMS GET Error:', getErr.message);
    }
  }

  // 2. Try Twilio if configured
  if (twilioSid && twilioToken && twilioFrom && typeof fetchFn === 'function') {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('From', twilioFrom);
      params.append('Body', `Your Parxéé City verification code is ${otpCode}. Valid for 5 minutes.`);

      const twilioRes = await fetchFn(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
      const twilioData = await twilioRes.json();
      if (twilioRes.ok && twilioData.sid) {
        console.log(`[SMS Helper] Twilio OTP sent successfully to ${formattedPhone}`);
        return { success: true, provider: 'Twilio' };
      }
      console.warn('[SMS Helper] Twilio Error:', twilioData);
    } catch (twErr) {
      console.error('[SMS Helper] Twilio Exception:', twErr.message);
    }
  }

  // Gateway unconfigured or failed
  console.log(`[SMS Helper] No active SMS gateway for ${phone}. Dev OTP code is: ${otpCode}`);
  return { success: false, error: 'SMS Gateway unconfigured or failed' };
}

module.exports = { sendSmsOtp };
