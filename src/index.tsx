import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home, Stat } from "./views";

const App: React.FC = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/stat" component={Stat} />
      <Route path="/" component={Home} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById("root"));
