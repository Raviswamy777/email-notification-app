import SibApiV3Sdk  from 'sib-api-v3-sdk';
import 'dotenv/config'

const processConfig = {
//   sendinBlueApiKey: process.env.BREVO_SECRET,
    
  sendinBlueApiKey: process.env.BREVO_SEC || '236c3ecd',
  brevoEmail: 'raviswamyp@gmail.com',
  brevoTeamName: 'Ravi',
  brevoTemplateId: 1,
};

// Configure API key authorization: api-key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = processConfig.sendinBlueApiKey;

async function sendEmailBrevo(to, subject, message) {

  try {
    // Create an instance of the API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Specify the email details
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to, name: 'Ravi' }];
    sendSmtpEmail.sender = {
      email: processConfig.brevoEmail,
      name: processConfig.brevoTeamName,
    };
    sendSmtpEmail.templateId = +processConfig.brevoTemplateId;
    sendSmtpEmail.params = {
      subject: subject,
      body: message,
    };

    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  } catch (error) {
      console.log('Error Sending Email', error.message);
      throw error;
  }
}

export default sendEmailBrevo;
