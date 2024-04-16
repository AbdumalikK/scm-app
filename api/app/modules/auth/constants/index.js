export const SIGNUP_PAYLOAD = (code) => {
    return `Ваш код для подтверждения ${code}.\nНикому не сообщайте!`
}

export const FORGOT_PASSWORD_PAYLOAD = (otp) => {
    return `Ваш код для восстановления пароля ${otp}.\nНикому не сообщайте!`
}