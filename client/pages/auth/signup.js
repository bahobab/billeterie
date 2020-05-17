import { useState } from "react";
import Router from "next/router";

import useRequest from "../../hooks/use-request";

export default () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { errors, doRequest } = useRequest({
    url: `/api/users/signup`,
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await doRequest();
      setEmail("");
      setPassword("");
    } catch (err) {}
  };

  return (
    <div className="container">
      <h1>Sign up</h1>
      <form onSubmit={onFormSubmit}>
        <div className="form-group">
          <label htmlFor="email">email</label>
          <input
            type="text"
            value={email}
            id="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            id="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Sign up</button>
      </form>
    </div>
  );
};
