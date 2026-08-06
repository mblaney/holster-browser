import {useEffect, useState} from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import FilledInput from "@mui/material/FilledInput"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Typography from "@mui/material/Typography"
import ContentCopy from "@mui/icons-material/ContentCopy"

const LoginCodes = ({user, host, code}) => {
  const [loginCodes, setLoginCodes] = useState([])

  useEffect(() => {
    if (!user || !host || !code) return

    const updated = new Map()
    let secret = null

    const update = async codes => {
      if (!codes || !secret) return

      for (const [key, enc] of Object.entries(codes)) {
        if (!key) continue

        if (enc) {
          updated.set(key, {
            key: key,
            code: await user.SEA.decrypt(enc, secret),
          })
        } else {
          updated.delete(key)
        }
      }
      setLoginCodes([...updated.values()])
    }

    user.get([host, "epub"], async epub => {
      if (!epub) {
        console.error("No epub for host!")
        return
      }

      secret = await user.SEA.secret({epub: epub}, user.is)
      user.get([host, "shared"]).next("login_codes").next(code).on(update, true)
    })

    return () => {
      user.get([host, "shared"]).next("login_codes").next(code).off(update)
    }
  }, [user, host, code])

  const select = target => {
    const li = target.closest("li")
    if (li && li.childNodes[0].childNodes[0].nodeName === "INPUT") {
      li.childNodes[0].childNodes[0].select()
    } else {
      console.error("not input field", li.childNodes[0].childNodes[0].nodeName)
    }
  }

  if (loginCodes.length === 0) return null

  return (
    <Card sx={{mt: 2}}>
      <CardContent>
        <Typography sx={{m: 1}}>
          You have <strong>{loginCodes.length}</strong> login code
          {loginCodes.length > 1 ? "s" : ""} you can share
        </Typography>
        <List dense={true} sx={{maxHeight: 300, overflow: "auto"}}>
          {loginCodes.map(item => (
            <ListItem key={item.key}>
              <FilledInput
                defaultValue={item.code}
                readOnly={true}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label="copy login code"
                      onClick={event => select(event.target)}
                    >
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

export default LoginCodes
