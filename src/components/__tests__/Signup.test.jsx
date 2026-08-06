import {describe, it, expect, beforeEach, vi} from "vitest"
import {render, screen, act} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Signup from "../Signup.jsx"

function createMockUser({createErr = null, authErr = null, is = null} = {}) {
  const user = {
    is,
    create: vi.fn((username, password, cb) => cb(createErr)),
    auth: vi.fn((username, password, cb) => {
      if (!authErr) user.is = {pub: "mock-pub", epub: "mock-epub"}
      cb(authErr)
    }),
    delete: vi.fn((username, password, cb) => cb && cb(null)),
  }
  return user
}

function mockFetchResponse(ok, text) {
  return Promise.resolve({ok, text: () => Promise.resolve(text)})
}

async function fillAndSubmit({username, email}) {
  if (username !== undefined) {
    await userEvent.type(screen.getByLabelText("Username"), username)
  }
  if (email !== undefined) {
    await userEvent.type(screen.getByLabelText("Email"), email)
  }
  await userEvent.click(screen.getByRole("button", {name: "Submit"}))
}

describe("Signup Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
    delete window.location
    window.location = {href: ""}
  })

  it("renders the signup form", () => {
    const user = createMockUser()
    render(<Signup user={user} />)
    expect(screen.getByText("Sign up")).toBeTruthy()
    expect(screen.getByLabelText("Username")).toBeTruthy()
    expect(screen.getByLabelText("Email")).toBeTruthy()
  })

  it("shows already logged in and disables submit when a user is present", () => {
    const user = createMockUser({is: {pub: "existing-pub"}})
    render(<Signup user={user} />)
    expect(screen.getByText("Already logged in")).toBeTruthy()
    expect(screen.getByRole("button", {name: "Submit"})).toBeDisabled()
  })

  it("requires a username", async () => {
    const user = createMockUser()
    render(<Signup user={user} />)
    await act(async () => {
      await fillAndSubmit({email: "alice@test.com"})
    })
    expect(screen.getByText("Please choose a username")).toBeTruthy()
    expect(user.create).not.toHaveBeenCalled()
  })

  it("rejects a username with invalid characters", async () => {
    const user = createMockUser()
    render(<Signup user={user} />)
    await act(async () => {
      await fillAndSubmit({username: "alice!", email: "alice@test.com"})
    })
    expect(
      screen.getByText(
        "Username must contain only numbers, letters and underscore",
      ),
    ).toBeTruthy()
    expect(user.create).not.toHaveBeenCalled()
  })

  it("requires an email", async () => {
    const user = createMockUser()
    render(<Signup user={user} />)
    await act(async () => {
      await fillAndSubmit({username: "alice"})
    })
    expect(screen.getByText("Please provide your email")).toBeTruthy()
    expect(user.create).not.toHaveBeenCalled()
  })

  it("submits the typed password", async () => {
    const user = createMockUser()
    fetch.mockReturnValue(mockFetchResponse(true, ""))
    render(<Signup user={user} />)

    await act(async () => {
      await userEvent.type(screen.getByLabelText("Username"), "alice")
      await userEvent.type(screen.getByLabelText("Password"), "hunter2")
      await userEvent.type(screen.getByLabelText("Email"), "alice@test.com")
      await userEvent.click(screen.getByRole("button", {name: "Submit"}))
    })

    expect(user.create).toHaveBeenCalledWith(
      "alice",
      "hunter2",
      expect.any(Function),
    )
  })

  it("creates the account, posts to /signup, and redirects on success", async () => {
    const user = createMockUser()
    fetch.mockReturnValue(mockFetchResponse(true, ""))
    render(<Signup user={user} />)

    await act(async () => {
      await fillAndSubmit({username: "alice", email: "alice@test.com"})
    })

    expect(user.create).toHaveBeenCalledWith("alice", "", expect.any(Function))
    expect(user.auth).toHaveBeenCalledWith("alice", "", expect.any(Function))
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/signup"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          pub: "mock-pub",
          epub: "mock-epub",
          username: "alice",
          email: "alice@test.com",
        }),
      }),
    )
    expect(screen.getByText("Account created")).toBeTruthy()
    expect(window.location).toBe("/login")
  })

  it("deletes the local account and shows the error on failure", async () => {
    const user = createMockUser()
    fetch.mockReturnValue(
      mockFetchResponse(
        false,
        "Signup is not available, please try again in a few minutes",
      ),
    )
    render(<Signup user={user} />)

    await act(async () => {
      await fillAndSubmit({username: "alice", email: "alice@test.com"})
    })

    expect(user.delete).toHaveBeenCalledWith("alice", "", expect.any(Function))
    expect(
      screen.getByText(
        "Signup is not available, please try again in a few minutes",
      ),
    ).toBeTruthy()
    expect(window.location).toEqual({href: ""})
  })

  it("shows the error and stops when user.create fails", async () => {
    const user = createMockUser({createErr: "username already taken"})
    render(<Signup user={user} />)

    await act(async () => {
      await fillAndSubmit({username: "alice", email: "alice@test.com"})
    })

    expect(screen.getByText("username already taken")).toBeTruthy()
    expect(user.auth).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows the error and stops when user.auth fails", async () => {
    const user = createMockUser({authErr: "wrong password"})
    render(<Signup user={user} />)

    await act(async () => {
      await fillAndSubmit({username: "alice", email: "alice@test.com"})
    })

    expect(screen.getByText("wrong password")).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
})
