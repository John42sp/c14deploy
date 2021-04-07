import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs'; //tbm vem com o node

class SendMailServices {
    private client: Transporter

    constructor() {
        nodemailer.createTestAccount().then(account => {
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            //colocando todos valores do transporter no cliente, e assim podemos usar cliente no execute()
            this.client = transporter; 
        }) .catch((err) => {
            console.log(err.message); // something bad happened
        });
    }

    async execute(to: string, subject: string, variables: object, path: string) {
       
       const templateFileContent = fs.readFileSync(path).toString("utf-8");
       const mailTemplateParse = handlebars.compile(templateFileContent);

       const html = mailTemplateParse(variables);

    //    const html = mailTemplateParse({ //variaveis name, title e description, do npsMail.hbs, 
    //        name: to,
    //        title: subject,
    //        description: body
           
    //    })
       const message =  await this.client.sendMail({
            to,
            subject,
            html,
            from: "NPS <noreplay@nps.com.br>"
        })

        console.log("Message sent: %s", message.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));


    }
}

export default new SendMailServices(); //para já criar nossa instancia assim que app for executada