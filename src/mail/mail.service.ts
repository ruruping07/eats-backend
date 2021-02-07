import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail( subject: string, template: string, emailVars: EmailVar[],): Promise<boolean> {
    const form = new FormData();

    form.append('from',`Eats <mailgun@${this.options.domain}>`,);
    form.append('to', `ruruping07@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

/*
> Buffer.from('api:YOUR_API_KEY').toString('base64')
'YXBpOllPVVJfQVBJX0tFWQ=='
*/

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      console.log("mail send cucceed");
      return true;
    } catch (error) {
      console.log("mail send ");
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      '사용자 Email 인증', 
      'verify-email', 
      [
        { key: 'verify-code', value: code }, 
        { key: 'username', value: email },
      ]
    );
  }
}