import {useRef, useState} from "react"
import {styled, alpha, useTheme} from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import InputBase from "@mui/material/InputBase"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"
import Switch from "@mui/material/Switch"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import MoreIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"

const Search = styled("div", {
  shouldForwardProp: prop => prop !== "collapsed",
})(({theme, collapsed}) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: collapsed ? "auto" : "100%",
  ...(collapsed && {
    maxWidth: theme.spacing(7),
    overflow: "hidden",
    transition: theme.transitions.create("max-width"),
    "&:focus-within": {maxWidth: "200px"},
  }),
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({theme}) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: prop => prop !== "collapsed",
})(({theme, collapsed}) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: collapsed ? 0 : "100%",
    ...(collapsed && {
      "&:focus": {width: "8ch"},
    }),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
    },
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

const SearchAppBar = ({
  name,
  icon: AppIcon,
  iconSx,
  onHomeClick,
  title,
  onTitleClick,
  onSearch,
  searchQuery,
  mode,
  setMode,
  menuItems,
}) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))
  const collapsed = !!title && isSmall
  const searchInputRef = useRef(null)
  const [searchValue, setSearchValue] = useState(searchQuery || "")
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const changeMode = () => {
    sessionStorage.setItem("mode", mode === "light" ? "dark" : "light")
    setMode(mode === "light" ? "dark" : "light")
  }

  const menuId = "search-account-menu"
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{vertical: "top", horizontal: "right"}}
      id={menuId}
      keepMounted
      transformOrigin={{vertical: "top", horizontal: "right"}}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {(menuItems ?? []).map(item => (
        <MenuItem
          key={item.label}
          onClick={() => {
            handleMenuClose()
            item.onClick()
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  )

  const mobileMenuId = "search-account-menu-mobile"
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{vertical: "top", horizontal: "right"}}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{vertical: "top", horizontal: "right"}}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircleIcon />
        </IconButton>
        <p>Account</p>
      </MenuItem>
      <MenuItem onClick={changeMode}>
        <IconButton size="large" color="inherit">
          {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <p>{mode === "light" ? "Dark" : "Light"} mode</p>
      </MenuItem>
    </Menu>
  )

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="fixed">
        <Toolbar>
          {AppIcon && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="home"
              onClick={onHomeClick ?? (() => (window.location = "/"))}
            >
              <AppIcon sx={iconSx} />
            </IconButton>
          )}
          {title ? (
            <Button
              sx={{
                color: "white",
                fontSize: "1.25em",
                textTransform: "none",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                display: "block",
              }}
              onClick={onTitleClick}
            >
              {title}
            </Button>
          ) : (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{display: {xs: "none", sm: "block"}}}
            >
              {name}
            </Typography>
          )}
          <Box sx={{flexGrow: 1}} />
          <Search
            collapsed={collapsed}
            onClick={() => searchInputRef.current?.focus()}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              collapsed={collapsed}
              inputRef={searchInputRef}
              placeholder="Search…"
              inputProps={{"aria-label": "search"}}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const trimmed = searchValue.trim()
                  if (trimmed.length >= 3) {
                    setSearchValue(trimmed)
                    if (onSearch) {
                      onSearch(trimmed)
                    } else {
                      window.location = `/?search=${encodeURIComponent(trimmed)}`
                    }
                    searchInputRef.current?.blur()
                  }
                } else if (e.key === "Escape") {
                  setSearchValue("")
                  if (onSearch) onSearch("")
                  searchInputRef.current?.blur()
                }
              }}
            />
          </Search>
          <Box sx={{display: {xs: "none", md: "flex"}}}>
            <Switch checked={mode === "dark"} onChange={changeMode} />
          </Box>
          <Box sx={{display: {xs: "none", md: "flex"}}}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
          <Box sx={{display: {xs: "flex", md: "none"}}}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {renderMobileMenu}
      {renderMenu}
    </Box>
  )
}

export default SearchAppBar
