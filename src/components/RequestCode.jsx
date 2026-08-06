import {useState} from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

const RequestCode = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [disabledButton, setDisabledButton] = useState(false)

  const request = () => {
    if (!email) {
      setMessage("Please provide your email")
      return
    }

    setDisabledButton(true)
    setMessage("Requesting login code...")
    fetch(`${window.location.origin}/request-login-code`, {
      method: "POST",
      headers: {"Content-Type": "application/json;charset=utf-8"},
      body: JSON.stringify({email: email}),
    })
      .then(res => res.text().then(text => ({ok: res.ok, text: text})))
      .then(res => {
        setDisabledButton(false)
        if (!res.ok) {
          setMessage(res.text)
          return
        }
        setEmail("")
        setMessage(res.text)
      })
  }

  return (
    <>
      <Typography variant="h5">Request login code</Typography>
      <TextField
        id="request-email"
        label="Email"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <Button
        sx={{mt: 1}}
        variant="contained"
        disabled={disabledButton}
        onClick={request}
      >
        Submit
      </Button>
      {message && (
        <Typography sx={{m: 1}} variant="string">
          {message}
        </Typography>
      )}
    </>
  )
}

export default RequestCode
