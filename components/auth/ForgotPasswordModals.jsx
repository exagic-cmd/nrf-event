import { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import useUserStore from '@/store/useAuthStore';
import { useTranslation } from 'next-i18next';
export default function ForgotPasswordModals({ onClose }) {
  const { t } = useTranslation('auth'); 
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { forgotPassword, resetPassword, loading } = useUserStore();
  const handleStep1 = async () => {
    if (!email) return alert(t('emailRequired'));

    const res = await forgotPassword(email);

    if (res.success) {
      setStep(2);
      setTimeout(() => {
        setResetToken(res.token);
        setStep(3);
      }, 5000);
    } else {
      alert(res.error || t('failedToSend'));
      setStep(2);
    }
  };

  const handleStep3 = async () => {
    if (!newPassword || !confirmPassword) return alert(t('fillAllFields'));
    if (newPassword !== confirmPassword) return alert(t('passwordsDontMatch'));

    const res = await resetPassword({
      email,
      token: resetToken,
      password: newPassword,
      password_confirmation: confirmPassword,
    });

    if (res.success) {
      alert(t('passwordResetSuccess'));
      setStep(1);
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
    } else {
      alert(res.error || t('resetFailed'));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {step === 1 && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        )}

        <h2 className="text-xl font-semibold mb-4 text-[#CC9A55]">
          {step === 1 ? t('forgotPassword') : step === 3 ? t('resetNewPassword') : ''}
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              placeholder={t('enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={handleStep1}
              className="w-full bg-[#CC9A55] text-white p-2 rounded hover:bg-[#cb913f] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('sending') : t('sendEmail')}
            </button>
          </>
        )}

        {step === 2 && (
          <div className="mb-4 text-center">
            {resetToken ? (
              <>
                <p className="text-green-600 font-bold">{t('emailSentSuccess')}</p>
                <p className="text-md text-gray-600 my-2">{t('sentTo')}</p>
                <p className="text-md font-medium text-black">{email}</p>
              </>
            ) : (
              <>
                <p className="text-red-600 font-bold">{t('emailSentFailed')}</p>
                <button onClick={onClose} className="text-gray-500 hover:text-black mt-2">
                  {t('close')}
                </button>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-2 border border-gray-300 rounded pr-10"
                placeholder={t('newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full p-2 border border-gray-300 rounded pr-10"
                placeholder={t('confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2.5 text-gray-500"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleStep3}
              className="w-full bg-[#CC9A55] text-white p-2 rounded hover:bg-[#cb913f] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('submitting') : t('resetPassword')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
