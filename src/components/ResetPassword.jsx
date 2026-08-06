import {useState} from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

const ResetPassword = ({loggedIn}) => {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState(loggedIn ? "Already logged in" : "")
  const [disabledButton, setDisabledButton] = useState(loggedIn)

  const reset = () => {
    if (!email) {
      setMessage("Please provide your email")
      return
    }

    setDisabledButton(true)
    setMessage("Checking account...")
    fetch(`${window.location.origin}/reset-password`, {
      method: "POST",
      headers: {"Content-Type": "application/json;charset=utf-8"},
      body: JSON.stringify({email: email, code: code}),
    })
      .then(res => res.text().then(text => ({ok: res.ok, text: text})))
      .then(res => {
        setDisabledButton(false)
        setMessage(res.text)
      })
  }

  return (
    <>
      <Typography variant="h5">Reset Password</Typography>
      <TextField
        id="reset-password-email"
        label="Email"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextField
        id="reset-password-code"
        label="Login code"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={code}
        onChange={event => setCode(event.target.value)}
      />
      <Button
        sx={{mt: 1}}
        variant="contained"
        disabled={disabledButton}
        onClick={reset}
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

export default ResetPassword
