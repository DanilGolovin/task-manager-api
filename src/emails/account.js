const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'danyk612345@gmail.com',
        subject: 'Its me!',
        text: `Welcome ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail
}