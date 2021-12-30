import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home, Stat, Train, Models } from "./views";

const App: React.FC = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/stat" component={Stat} />
      <Route path="/models" component={Models} />
      <Route path="/train" component={Train} />
      <Route path="/" component={Home} />
    </Switch>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById("root"));
