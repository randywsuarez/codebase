const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const logger = require('./logger');
const i18nextInstance = require('../config/i18n'); // Importar i18next

// Clase para manejar el envío de correos electrónicos
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName || 'Usuario';
    this.language = user.language || i18nextInstance.language; // Usar idioma del usuario o el predeterminado de i18next
    this.url = url; // URL para acciones como cambiar contraseña, verificar email, etc.
    this.from = `\"${process.env.EMAIL_FROM_NAME || 'Tu Aplicación'}\" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`;
    this.appName = process.env.APP_NAME || 'Tu Aplicación';
  }

  // Crear un transporte de correo
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Usar SendGrid para producción
      return nodemailer.createTransport({
        service: 'SendGrid', // No es necesario proporcionar host/port/etc.
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Usar Mailtrap para desarrollo
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Método para enviar el correo
  async send(template, subjectKey, templateVars = {}) {
    try {
      // Obtener la función t para el idioma y namespace correctos
      const t = i18nextInstance.getFixedT(this.language, 'emails');
      const subject = t(subjectKey); // Traducir el subject usando la clave proporcionada

      // 1) Renderizar la plantilla HTML basada en una plantilla Pug
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          // Variables base pasadas a todas las plantillas
          firstName: this.firstName,
          url: this.url,
          subject: subject, // El subject ya traducido
          appName: this.appName,
          t: t, // Pasar la función de traducción a la plantilla
          // Sobrescribir o añadir variables específicas de la plantilla
          ...templateVars,
        }
      );

      // 2) Definir las opciones del correo
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject, // Subject ya traducido
        html,
        text: convert(html, {
          wordwrap: 130,
        }),
      };

      // 3) Crear un transporte y enviar el correo
      await this.newTransport().sendMail(mailOptions);
      logger.info(`Correo enviado a ${this.to} con asunto: ${subject}`);
    } catch (error) {
      logger.error(`Error al enviar el correo (plantilla: ${template}, asuntoKey: ${subjectKey}) a ${this.to}:`, error);
      // No relanzar el error para no bloquear el flujo principal si el correo falla,
      // pero se podría considerar una estrategia de reintentos o notificación a administradores.
      // throw new Error('Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
    }
  }

  // Método para enviar correo de bienvenida
  async sendWelcome() {
    await this.send('welcome', 'welcome.title'); // Asumiendo que tienes welcome.title en tus JSON
  }

  // Método para enviar correo de restablecimiento de contraseña
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'passwordReset.title' // Asumiendo passwordReset.title
    );
  }

  // Método para enviar correo de verificación de correo electrónico
  async sendEmailVerification() {
    await this.send(
      'verifyEmail',
      'verifyEmail.title' // Asumiendo verifyEmail.title
    );
  }

  // Método para notificar cambio de contraseña
  async sendPasswordChangeNotification() {
    await this.send(
      'passwordChanged',
      'passwordChanged.title' // Asumiendo passwordChanged.title
    );
  }

  // Método para notificar inicio de sesión desde un dispositivo nuevo
  async sendLoginNotification(loginDetails) {
    // loginDetails debería contener: dateTime, ipAddress, deviceInfo, location
    await this.send('loginNotification', 'loginNotification.title', {
      // Las variables específicas para la plantilla loginNotification
      dateTime: loginDetails.dateTime || new Date().toLocaleString(this.language === 'es' ? 'es-ES' : 'en-US'),
      ipAddress: loginDetails.ipAddress || 'Desconocida',
      deviceInfo: loginDetails.deviceInfo || 'Desconocido',
      location: loginDetails.location || 'Desconocida',
      // url ya está disponible a través de this.url, que se pasa en send()
      // appName ya está disponible a través de this.appName, que se pasa en send()
      // firstName ya está disponible a través de this.firstName, que se pasa en send()
      // t se pasa automáticamente en send()
    });
  }
};
