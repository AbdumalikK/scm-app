export const OTP = (otp, username) => (
    `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>
      <style type="text/css">
        * {
          font-family: Helvetica, Arial, sans-serif;
        }
      </style>
      <base href="https://reverem.uz/" />
    </head>
    <body>
      <table
        border="0"
        cellpadding="0"
        cellspacing="0"
        style="margin: 0 auto; border-collapse: separate; padding: 0; width: 100%"
      >
        <tbody>
          <tr>
            <td style="padding: 33px 0" bgcolor="#F3F4F8">
              <center>
                <img
                  src="mail/imgs/logo_horizontal-dark.png"
                  alt=""
                  border="0"
                  width="170"
                  height="31"
                  style="display: block"
                />
              </center>
            </td>
          </tr>
          <tr>
            <td style="height: 58px; font-size: 58px; line-height: 58px"></td>
          </tr>
          <tr>
            <td>
              <table
                style="
                  width: 640px;
                  border-collapse: separate;
                  border-spacing: 0;
                  margin: 0 auto;
                "
              >
                <tbody>
                  <tr>
                    <td align="center" style="font-size: 18px; line-height: 28px">
                      <strong>Salom, ${username}!</strong>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="height: 14px; font-size: 14px; line-height: 14px"
                    ></td>
                  </tr>
                  <tr>
                    <td align="center">
                      <table>
                        <tbody>
                          <tr>
                            <td
                              style="
                                display: inline-block;
                                padding: 40px 125px;
                                border-radius: 20px;
                                background-color: #f3f4f8;
                                text-decoration: none;
                                font-size: 36px;
                                line-height: 28px;
                                color: #0e1133;
                                font-weight: 400;
                                border: 3px dashed #9ba0ad;
                              "
                            >
                              ${otp}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="height: 14px; font-size: 14px; line-height: 14px"
                    ></td>
                  </tr>
  
                  <tr>
                    <td align="center" style="font-size: 14px; line-height: 22px">
                    Bu <a href="https://reverem.uz" style="color: #2b4eff; text-decoration: none">reverem.uz</a> da ro’yxatga olish qilishingiz uchun bir martalik parol. <br />Parol 5 daqiqa amal qiladi.
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="height: 31px; font-size: 31px; line-height: 31px"
                    ></td>
                  </tr>
  
                  <tr>
                    <td
                      align="center"
                      style="color: #9ba0ad; font-size: 14px; line-height: 22px"
                    >
                    Agar bu siz bo’lmasangiz, ushbu xatga e’tibor bermang yoki bu haqida <a href='https://t.me/theabdumalik'>bizga xabar</a> bering.
                    </td>
                  </tr>
  
                  <tr
                    style="height: 52px; font-size: 52px; line-height: 52px"
                  ></tr>
                </tbody>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#0E1133">
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin: 0 auto;
                  border-collapse: separate;
                  padding: 0;
                  width: 100%;
                "
              >
                <tbody>
                  <tr
                    style="height: 25px; font-size: 25px; line-height: 25px"
                  ></tr>
                  <tr>
                    <td>
                      <center>
                        <img
                          src="mail/imgs/logo_horizontal-white.png"
                          width="120"
                          height="23"
                          alt=""
                        />
                      </center>
                    </td>
                  </tr>
                  <tr
                    style="height: 25px; font-size: 25px; line-height: 25px"
                  ></tr>
                  <tr>
                    <td
                      style="font-size: 12px; line-height: 18px; color: #9ba0ad"
                    >
                      <center
                        style="max-width: 544px; width: 100%; margin: 0 auto"
                      >
                      © 2024 "REVEREM". Barcha huquqlar himoyalangan. <br /> Toshkent sh., Chimrobog ko’ch., 7 Tel.: <a href="tel:+998123456789" style="color: #ffffff; text-decoration: none">+998 12 345-67-89</a>
                      </center>
                    </td>
                  </tr>
                  <tr
                    style="height: 25px; font-size: 25px; line-height: 25px"
                  ></tr>
                  <tr>
                    <td>
                      <center>
                        <table>
                          <tbody>
                            <tr>
                              <td style="padding: 8px">
                                <a
                                  href="https://reverem.uz/tg"
                                  style="text-decoration: none"
                                >
                                  <img
                                    src="mail/icons/telegram.png"
                                    height="24"
                                    width="24"
                                    alt="telegram"
                                  />
                                </a>
                              </td>
                              <td style="padding: 8px">
                                <a
                                  href="https://reverem.uz/tw"
                                  style="text-decoration: none"
                                >
                                  <img
                                    src="mail/icons/twitter.png"
                                    height="24"
                                    width="24"
                                    alt="twitter"
                                  />
                                </a>
                              </td>
                              <td style="padding: 8px">
                                <a
                                  href="https://reverem.uz/wh"
                                  style="text-decoration: none"
                                >
                                  <img
                                    src="mail/icons/whatsapp.png"
                                    height="24"
                                    width="24"
                                    alt="whatsapp"
                                  />
                                </a>
                              </td>
                              <td style="padding: 8px">
                                <a
                                  href="https://reverem.uz/fb"
                                  style="text-decoration: none"
                                >
                                  <img
                                    src="mail/icons/fb.png"
                                    height="24"
                                    width="24"
                                    alt="facebook"
                                  />
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </center>
                    </td>
                  </tr>
                  <tr
                    style="height: 25px; font-size: 25px; line-height: 25px"
                  ></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `
)