const nodemailer = require("nodemailer");
const fs = require('fs')

class SMTP {
    constructor(obj){
        this.email={
            verify:[],
            forgot:[],
            config:{
                pool:true,
                maxConnections:10,
                maxMessages:100,
                host: obj.host,
                port: obj.port,
                secure: false,
                requireTLS:true,
                auth: {
                    user: obj.user, 
                    pass: obj.pass, 
                },
            }
        }
        this.mail={
            from: `"It Connects Us" <${obj.user}>`, 
            to: "",
            subject: "",
            html:"", 
            priority:"high",
            attachments: [{
                filename: '',
                path: __dirname +'/assets/logoB.png',
                cid: 'logoB' 
            }]
        }
        try {
            this.email.verify = this.loadPage('verify')
            this.email.forgot = this.loadPage('forgot')
            this.email.newsletter = this.loadPage('newsletter')
          } catch (err) {
            console.error(err)
          }
    }
    loadPage= (page) =>fs.readFileSync(__dirname+`/pages/${page}.html`, 'utf8').split("######")
    fillPage=(page,data)=> (page[0] + data.user + page[1] + data.email + page[2] + data.url + page[3])
    connect = () => this.transporter = nodemailer.createTransport(this.email.config);
    disconnect = () => this.transporter.close()
    sendMail = (obj) =>{
        switch(obj.type){
            case "FORGOT_PASSWORD": this.mail.html=this.email.forgot[0] + obj.user + this.email.forgot[1] + obj.email + this.email.forgot[2] + obj.url + this.email.forgot[3]
                                    this.mail.subject="Value Chain Study | Password Reset"
                                    break;
            case "EMAIL_VERIFY"   : this.mail.html=this.email.verify[0] + obj.user + this.email.verify[1] + obj.url + this.email.verify[2]
                                    this.mail.subject="Value Chain Study | Account Verification"
                                    break;
            case "NEWSLETTER_SUBSCRIBED"   : this.mail.html=this.email.newsletter[0] + obj.user + this.email.newsletter[1] 
                                    this.mail.subject="Value Chain Study | Newsletter"
                                    break;
        }
        this.mail.to=obj.email;
        this.transporter.sendMail(this.mail,(err,info)=>{console.log("Message sent: ", err,info)})
    }

}
module.exports=SMTP