const fetchFn = typeof fetch !== 'undefined' ? fetch : global.fetch;

/**
 * Send SMS OTP via Fast2SMS, 2Factor, or Twilio API
 * @param {string} phone - Target phone number
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<{ success: boolean, provider?: string, error?: string }>}
 */
async function sendSmsOtp(phone, otpCode) {
  if (!phone) {
    return { success: false, error: 'No phone number provided' };
  }

  // Extract clean digits
  const rawDigits = phone.replace(/\D/g, '');
  
  // 10-digit Indian phone number extraction (Fast2SMS / 2Factor expect 10 digits without 91 prefix)
  const target10Digit = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
  
  // E.164 format for international gateways like Twilio
  const formattedE164 = target10Digit.length === 10 ? `+91${target10Digit}` : `+${rawDigits}`;

  const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
  const twoFactorKey = (process.env.TWOFACTOR_API_KEY || process.env['2FACTOR_API_KEY'] || '').trim();
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  // 1. Try 2Factor.in (Popular instant OTP service in India)
  if (twoFactorKey && typeof fetchFn === 'function') {
    try {
      const url = `https://2factor.in/API/V1/${encodeURIComponent(twoFactorKey)}/SMS/${target10Digit}/${otpCode}/AUTOGEN`;
      const res = await fetchFn(url);
      const data = await res.json();
      if (data && (data.Status === 'Success' || data.status === 'Success')) {
        console.log(`[SMS Helper] 2Factor.in OTP sent successfully to ${target10Digit}`);
        return { success: true, provider: '2Factor' };
      }
      console.warn('[SMS Helper] 2Factor returned non-success status:', data);
    } catch (twoErr) {
      console.error('[SMS Helper] 2Factor Exception:', twoErr.message);
    }
  }

  // 2. Try Fast2SMS (POST & GET Endpoints)
  if (fast2smsKey && typeof fetchFn === 'function') {
    // Fast2SMS Route 'otp' POST
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
          numbers: target10Digit
        })
      });
      const smsData = await response.json();
      if (smsData && (smsData.return || smsData.status_code === 200)) {
        console.log(`[SMS Helper] Fast2SMS OTP sent successfully to ${target10Digit}`);
        return { success: true, provider: 'Fast2SMS' };
      }
      console.warn('[SMS Helper] Fast2SMS POST returned non-success:', smsData);
    } catch (err) {
      console.error('[SMS Helper] Fast2SMS POST Error:', err.message);
    }

    // Fast2SMS GET route fallback
    try {
      const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2smsKey)}&route=otp&variables_values=${otpCode}&numbers=${target10Digit}`;
      const response = await fetchFn(getUrl);
      const smsData = await response.json();
      if (smsData && (smsData.return || smsData.status_code === 200)) {
        console.log(`[SMS Helper] Fast2SMS GET OTP sent successfully to ${target10Digit}`);
        return { success: true, provider: 'Fast2SMS' };
      }
    } catch (getErr) {
      console.error('[SMS Helper] Fast2SMS GET Error:', getErr.message);
    }
  }

  // 3. Try Twilio if configured
  if (twilioSid && twilioToken && twilioFrom && typeof fetchFn === 'function') {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedE164);
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
        console.log(`[SMS Helper] Twilio OTP sent successfully to ${formattedE164}`);
        return { success: true, provider: 'Twilio' };
      }
      console.warn('[SMS Helper] Twilio Error:', twilioData);
    } catch (twErr) {
      console.error('[SMS Helper] Twilio Exception:', twErr.message);
    }
  }

  // Gateway unconfigured or failed
  const errorMsg = (!fast2smsKey && !twilioSid && !twoFactorKey)
    ? 'SMS Gateway API Key is not configured in backend .env (Add FAST2SMS_API_KEY, TWOFACTOR_API_KEY, or TWILIO credentials)'
    : 'SMS Gateway provider returned an error or insufficient API balance';

  console.warn(`[SMS Helper] Failed to send SMS to ${phone}. Reason: ${errorMsg}`);
  return { success: false, error: errorMsg };
}

module.exports = { sendSmsOtp };
