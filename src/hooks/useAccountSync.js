import {useEffect, useState} from "react"

export function useAccountSync(holster, user, host, code) {
  const [accountsReady, setAccountsReady] = useState(false)

  useEffect(() => {
    if (!host || !user.is) return

    const updateAccounts = async accounts => {
      if (!accounts) return

      setAccountsReady(true)

      // Check accounts against the users list of contacts.
      const c = await new Promise(res => {
        user.get("public").next("contacts", res)
      })
      if (!c) return

      for (const [accountCode, account] of Object.entries(accounts)) {
        if (!account) continue

        // Only include properties that are present in the account
        let check = {}
        if (account.pub !== undefined) check.pub = account.pub
        if (account.username !== undefined) check.username = account.username
        if (account.name !== undefined) check.name = account.name
        if (account.ref !== undefined) check.ref = account.ref
        if (account.host !== undefined) check.host = account.host

        let found = false
        for (const [contactCode, contact] of Object.entries(c)) {
          if (contactCode !== accountCode) continue

          found = true
          // The account we're checking hasn't changed.
          if (contact.pub === check.pub) break

          // If the public key has changed for this contact then store their
          // new account details and re-share encrypted data with them to
          // help restore their account.
          const err = await new Promise(res => {
            user
              .get("public")
              .next("contacts")
              .next(contactCode)
              .put(check, res)
          })
          if (err) console.error(err)

          const oldEpub = await new Promise(res => {
            user.get([contact.pub, "epub"], res)
          })
          if (!oldEpub) {
            console.error("User not found for old public key")
            break
          }

          const epub = await new Promise(res => {
            user.get([check.pub, "epub"], res)
          })
          if (!epub) {
            console.error("User not found for new public key")
            break
          }

          const shared = await new Promise(res => {
            user.get("shared").next(contactCode, res)
          })
          if (!shared) break

          const oldSecret = await holster.SEA.secret(oldEpub, user.is)
          const secret = await holster.SEA.secret(epub, user.is)
          const update = {}
          for (const [key, oldEnc] of Object.entries(shared)) {
            if (!key) continue

            const data = await holster.SEA.decrypt(oldEnc, oldSecret)
            const enc = await holster.SEA.encrypt(data, secret)
            update[key] = enc
          }
          if (Object.keys(update).length !== 0) {
            const err = await new Promise(res => {
              user.get("shared").next(contactCode).put(update, res)
            })
            if (err) console.error(err)
          }
        }
        // Add the new contact if we referred them.
        if (!found && account.ref === code) {
          user
            .get("public")
            .next("contacts")
            .next(accountCode)
            .put(check, err => {
              if (err) console.error(err)
            })
        }
      }
    }

    user.get([host, "accounts"]).on(updateAccounts, true)

    return () => {
      user.get([host, "accounts"]).off(updateAccounts)
    }
  }, [host, code])

  return accountsReady
}
