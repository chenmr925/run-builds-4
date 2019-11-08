import * as React from "react";
import * as ReactDOM from "react-dom";
import "./index.scss";

import { Hello } from "./Hello";

const rootEl = document.createElement("div");
rootEl.id = "root";
document.body.appendChild(rootEl);

ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    rootEl
);