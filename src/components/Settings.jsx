import {useState} from "react"
import {grey} from "@mui/material/colors"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import Typography from "@mui/material/Typography"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import SearchAppBar from "./SearchAppBar.jsx"

const Settings = ({user, mode, setMode, appBar, buildDate, children}) => {
  const [name] = useState(() => {
    return sessionStorage.getItem("name") || localStorage.getItem("name") || ""
  })
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [disabledButton, setDisabledButton] = useState(false)

  const changePassword = () => {
    if (!password) {
      setMessage("Please provide your current password")
      return
    }

    if (!newPassword) {
      setMessage("Please provide a new password")
      return
    }

    setDisabledButton(true)
    setMessage("Updating password...")
    user.change(user.is.username, password, newPassword, err => {
      setDisabledButton(false)
      if (err) {
        setMessage(err)
      } else {
        setMessage("Password updated")
      }
    })
  }

  return (
    <>
      {user.is && <SearchAppBar mode={mode} setMode={setMode} {...appBar} />}
      <Container maxWidth="sm">
        <Grid container>
          <Grid item xs={12}>
            <Card sx={{mt: 2}}>
              <CardContent>
                <Typography sx={{m: 1}}>
                  {name
                    ? "Hello " + name
                    : "Account not found. Please try logging in again."}
                </Typography>
              </CardContent>
            </Card>
            {children}
            <Card sx={{mt: 2}}>
              <CardContent>
                <Typography sx={{m: 1}}>
                  Use this form to change your password
                </Typography>
                <FormControl
                  variant="outlined"
                  fullWidth={true}
                  margin="normal"
                >
                  <InputLabel htmlFor="settings-password">
                    Current Password
                  </InputLabel>
                  <OutlinedInput
                    id="settings-password"
                    autoComplete="password"
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
                    label="Current Password"
                  />
                </FormControl>
                <FormControl
                  variant="outlined"
                  fullWidth={true}
                  margin="normal"
                >
                  <InputLabel htmlFor="settings-new-password">
                    New Password
                  </InputLabel>
                  <OutlinedInput
                    id="settings-new-password"
                    autoComplete="new-password"
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
                <Button
                  sx={{mt: 1}}
                  variant="contained"
                  disabled={disabledButton}
                  onClick={changePassword}
                >
                  Submit
                </Button>
                {message && (
                  <Typography sx={{m: 1}} variant="string">
                    {message}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Card sx={{mt: 2}}>
              <CardContent>
                <Typography sx={{m: 1}}>Log out of your account</Typography>
                <Button
                  sx={{mt: 1}}
                  variant="contained"
                  onClick={() => {
                    user.leave()
                    sessionStorage.removeItem("name")
                    sessionStorage.removeItem("code")
                    localStorage.removeItem("name")
                    localStorage.removeItem("code")
                    window.location = "/login"
                  }}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
            {buildDate && (
              <Typography sx={{m: 1, color: grey[400]}}>
                Build date: {buildDate}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default Settings
