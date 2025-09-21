export const otpTemplate = (otp: string, verifyLink: string = "") => {
  return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CTMS OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2D89FF;
                    margin-bottom: 20px;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2D89FF;
                    background: #EAF3FF;
                    padding: 10px;
                    border-radius: 6px;
                    display: inline-block;
                    letter-spacing: 3px;
                }
                .footer {
                    font-size: 12px;
                    color: #888;
                    margin-top: 20px;
                }
                .btn {
                    display: inline-block;
                    background: #2D89FF;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .btn:hover {
                    background: #1c6ae5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="logo">Why Designers</h1>
                <h2>Verify Your Email</h2>
                <p>Your One-Time Password (OTP) for Why Designers verification is:</p>
                <div class="otp">${otp}</div>
                <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                <p class="footer">If you did not request this, please ignore this email.</p>
            </div>
        </body>
    </html>
`;
};

export const passwordTemplate = (password: string) => {
  return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Why Designers Password</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2D89FF;
                    margin-bottom: 20px;
                }
                .password {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2D89FF;
                    background: #EAF3FF;
                    padding: 10px;
                    border-radius: 6px;
                    display: inline-block;
                    letter-spacing: 3px;
                }
                .footer {
                    font-size: 12px;
                    color: #888;
                    margin-top: 20px;
                }
                .btn {
                    display: inline-block;
                    background: #2D89FF;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .btn:hover {
                    background: #1c6ae5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="logo">CTMS</h1>
                <h2>Here is your password</h2>
                <div class="password">${password}</div>
                <p>Please use this password to log in to your account.</p>
                <p class="footer">If you did not request this, please ignore this email.</p>
            </div>
        </body>
    </html>
`;
};

export const resetPasswordLinkTemplate = (link: string, text: string) => {
  return `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CTMS Reset Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    a {
                        text-decoration: none;
                        color: #2D89FF;
                        font-weight: bold;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2D89FF;
                        margin-bottom: 20px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #888;
                        margin-top: 20px;
                    }
                    .btn {
                        display: inline-block;
                        background: #2D89FF;
                        color: #ffffff;
                        padding: 10px 20px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    .btn:hover {
                        background: #1c6ae5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="logo">CTMS</h1>
                    <h2>Reset Password</h2>
                    <p>Please click the button below to reset your password:</p>
                    <a href="${link}" class="btn">${text}</a>
                    <p class="footer">If you did not request this, please ignore this email.</p>
                </div>
            </body>
        </html>
    `;
};
