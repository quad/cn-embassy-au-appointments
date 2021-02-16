# Chinese Embassy in Australia Appointments Check

My mate needs to replace her passport; and thus, she needs an appointment at
the embassy. The embassy opens slots for reservation on their website. But
those slots book out _fast_ and we're not sure when they open up.

This script checks the embassy's API for open slots and emails when there's
some available.

## Requirements

- Node (see: [`.tool-versions`](.tool-versions))
- Github Actions (see: [`.github/workflows/check.yml`](.github/workflows/check.yml))

## How to Run

```
$ npm i
...
$ env INPUT_RECORD_NUMBER="202101010112345" \
      INPUT_RECORD_AUTH_ANSWER="隨便啦" \
      INPUT_MAIL_USERNAME=user@example.com \
      INPUT_MAIL_PASSWORD=password \
      INPUT_MAIL_TO=recipient@example.com \
      node index.js
```


## TODO

- [ ] Check embassy addresses other than 墨尔本不见面办理
- [ ] Parameterise the SMTP host address (`INPUT_MAIL_HOST`)
- [ ] Parameterise the `From:` address (`INPUT_MAIL_FROM`)
- [ ] Parameterise the record authorisation question (`INPUT_RECORD_AUTH_QUESTION`)
- [ ] Filter by all `periodOfTime` limits
- [ ] Book a slot
- [ ] Sell to migration agents 😈
