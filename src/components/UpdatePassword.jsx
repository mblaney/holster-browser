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

const UpdatePassword = ({user, loggedIn, current, code, reset}) => {
  const [name, setName] = useState(current ?? "")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [repeatPassword, setRepeatPassword] = useState("")
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [message, setMessage] = useState(loggedIn ? "Already logged in" : "")
  const [disabledButton, setDisabledButton] = useState(loggedIn)

  const update = username => {
    if (!username) {
      setMessage("Please choose a username")
      return
    }

    setDisabledButton(true)
    setMessage("Updating password...")

    user.create(username, newPassword, err => {
      if (err) {
        if (err === "Username already exists") {
          let match = username.match(/^(\w+)\.(\d)$/)
          if (match) {
            let increment = Number(match[2]) + 1
            if (increment === 10) {
              setDisabledButton(false)
              setMessage("Too many password resets")
              return
            }
            update(`${match[1]}.${increment}`)
            return
          }
          update(`${username}.1`)
          return
        }
        setDisabledButton(false)
        setMessage(err)
        return
      }

      user.auth(username, newPassword, err => {
        if (err) {
          setDisabledButton(false)
          user.delete(username, newPassword)
          setMessage(err)
          return
        }

        fetch(`${window.location.origin}/update-password`, {
          method: "POST",
          headers: {"Content-Type": "application/json;charset=utf-8"},
          body: JSON.stringify({
            code: code ?? null,
            reset: reset ?? null,
            pub: user.is.pub,
            epub: user.is.epub,
            username: username,
            name: name,
          }),
        })
          .then(res => res.text().then(text => ({ok: res.ok, text: text})))
          .then(res => {
            if (!res.ok) {
              setDisabledButton(false)
              user.delete(username, newPassword)
              setMessage(res.text)
              return
            }

            // The previous public key is returned to copy public user data.
            user.get([res.text, "public"], data => {
              user.get("public").put(data, err => {
                if (err) console.error(err)
              })
            })

            setMessage("Password updated")
            setTimeout(() => {
              setDisabledButton(false)
              window.location = "/login"
            }, 2000)
          })
      })
    })
  }

  const submit = () => {
    if (newPassword !== repeatPassword) {
      setMessage("Passwords do not match")
      return
    }
    update(name)
  }

  return (
    <>
      <Typography variant="h5">Update Password</Typography>
      <TextField
        id="update-username"
        label="Username"
        variant="outlined"
        fullWidth={true}
        margin="normal"
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <FormControl variant="outlined" fullWidth={true} margin="normal">
        <InputLabel htmlFor="update-new-password">New Password</InputLabel>
        <OutlinedInput
          id="update-new-password"
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={event => setNewPassword(event.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle new password visibility"
                onClick={() => setShowNewPassword(show => !show)}
                edge="end"
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="New Password"
        />
      </FormControl>
      <FormControl variant="outlined" fullWidth={true} margin="normal">
        <InputLabel htmlFor="update-repeat-password">
          Repeat Password
        </InputLabel>
        <OutlinedInput
          id="update-repeat-password"
          type={showRepeatPassword ? "text" : "password"}
          value={repeatPassword}
          onChange={event => setRepeatPassword(event.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle repeat password visibility"
                onClick={() => setShowRepeatPassword(show => !show)}
                edge="end"
              >
                {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Repeat Password"
        />
      </FormControl>
      <Button
        sx={{mt: 1}}
        variant="contained"
        disabled={disabledButton}
        onClick={submit}
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

export default UpdatePassword
