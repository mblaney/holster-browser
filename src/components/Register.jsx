import {useState} from "react"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

const Register = ({user}) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState(user.is ? "Already logged in" : "")
  const [disabledButton, setDisabledButton] = useState(!!user.is)

  const register = () => {
    if (!username) {
      setMessage("Please choose a username")
      return
    }
    if (!/^\w+$/.test(username)) {
      setMessage("Username must contain only numbers, letters and underscore")
      return
    }
    if (!email) {
      setMessage("Please provide your email")
      return
    }

    setDisabledButton(true)
    setMessage("Checking login code...")
    fetch(`${window.location.origin}/check-login-code`, {
      method: "POST",
      headers: {"Content-Type": "application/json;charset=utf-8"},
      body: JSON.stringify({code: code}),
    })
      .then(res => res.text().then(text => ({ok: res.ok, text: text})))
      .then(res => {
        if (!res.ok) {
          setDisabledButton(false)
          setMessage(res.text)
          return
        }

        user.create(username, password, err => {
          if (err) {
            setDisabledButton(false)
            setMessage(err)
            return
          }

          user.auth(username, password, err => {
            if (err) {
              setDisabledButton(false)
              setMessage(err)
              return
            }

            fetch(`${window.location.origin}/verify-login-code`, {
              method: "POST",
              headers: {"Content-Type": "application/json;charset=utf-8"},
              body: JSON.stringify({
                code: code,
                pub: user.is.pub,
                epub: user.is.epub,
                username: username,
                email: email,
              }),
            })
              .then(res => res.text().then(text => ({ok: res.ok, text: text})))
              .then(res => {
                setDisabledButton(false)
                if (!res.ok) {
                  user.delete(username, password, console.log)
                  setMessage(res.text)
                  return
                }

                setMessage("Account created")
                window.location = "/login"
              })
          })
        })
      })
  }

  return (
    <>
      <Typography variant="h5">Register</Typography>
      <TextField
        id="register-username"
        label="Username"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={username}
        onChange={event => setUsername(event.target.value)}
        slotProps={{inputLabel: {shrink: true}}}
      />
      <FormControl variant="outlined" fullWidth={true} margin="normal">
        <InputLabel htmlFor="register-password">Password</InputLabel>
        <OutlinedInput
          id="register-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={event => setPassword(event.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(show => !show)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
      <TextField
        id="register-email"
        label="Email"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextField
        id="register-code"
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
        onClick={register}
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

export default Register
