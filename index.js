;(async () => {
  const axios = require('axios')
  const querystring = require('querystring')
  const assert = require('assert').strict
  const core = require('@actions/core')
  const nodemailer = require('nodemailer')

  const transport = axios.create({ baseURL: 'https://ppt.mfa.gov.cn/appo/service/reservation/data/' })

  const loginResponse = await transport.post(
    'getLastReservationInfo.json',
    querystring.stringify({
      recordNumber: core.getInput('record_number', { required: true }),
      questionID: '1193724fcf8041a4b627467826ebd77b', // 您父亲的姓名？
      answer: core.getInput('record_auth_answer', { required: true }),
    })
  )
  assert.equal(loginResponse.status, 200)
  assert.equal(loginResponse.data.status, 0)

  const sessionId = loginResponse.headers['set-cookie'].find(c => c.startsWith('pcxSessionId='))
  const scheduleResponse = await transport.post(
    'getReservationDateBean.json',
    querystring.stringify({
      addressName: '3bebedb12dae4b00967dbda5f8897949' // 墨尔本不见面办理
    }),
    { headers: { Cookie: sessionId } }
  )
  assert.equal(scheduleResponse.status, 200)
  assert.equal(scheduleResponse.data.status, 0)

  const schedule = scheduleResponse.data.data
  const appointments = schedule.flatMap(({date, orgName, periodOfTimeList}) =>
    periodOfTimeList
      /*
       * age <= limitOne (岁以下)
       * age >= limitTwo (岁以上)
       * expireDays <= limitThree (护照有效期天数 limitThree 天以下)
       * expireDays >= limitFour (护照有效期天数 limitFour 天以上)
       * isNotHandled && isFlag (疫情期间曾预约但未办理)
       * isCrossArea (不允许跨领区预约)
       */
      .filter(p => (p.age >= p.limitOne) && (p.userNumber < p.peopleNumber))
      .map(p => ({date, start: p.startTime, end: p.endTime, orgName, remain: p.userNumber, total: p.peopleNumber}))
  )

  if (appointments.length === 0) return

  await nodemailer
    .createTransport({
      host: "smtp.fastmail.com",
      port: 465,
      secure: true,
      auth: {
        user: core.getInput('mail_username', { required: true }),
        pass: core.getInput('mail_password', { required: true }),
      }})
    .sendMail({
      from: 'scott+embassybot@quadhome.com',
      to: core.getInput('mail_to', { required: true }),
      subject: 'Hourly Embassy Check',
      text: appointments
        .map(a => `${a.date} ${a.start} - ${a.end} @ ${a.orgName} (${a.remain} / ${a.total} left)`)
        .join("\n"),
      })

  console.log(`${appointments.length} appointments`)
})()
