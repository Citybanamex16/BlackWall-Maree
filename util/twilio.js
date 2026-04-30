const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Función para ENVIAR el código
exports.sendOTP = async (telefono) => {
    try {
        const numeroLimpio = telefono.replace(/\D/g, '');
        const numeroDestino = `+52${numeroLimpio}`;

        const verification = await client.verify.v2
            .services(serviceSid)
            .verifications.create({ to: numeroDestino, channel: 'sms' });

        return { success: true, sid: verification.sid };
    } catch (error) {
        console.error('Error al enviar con Verify:', error);
        return { success: false, error: error.message };
    }
};

// Función para VALIDAR el código que el usuario ingresa
exports.checkOTP = async (telefono, codigo) => {
    try {
        const numeroLimpio = telefono.replace(/\D/g, '');
        const numeroDestino = `+52${numeroLimpio}`;

        const check = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({ to: numeroDestino, code: codigo });

        return check.status === 'approved';
    } catch (error) {
        console.error('Error al validar con Verify:', error);
        return false;
    }
};