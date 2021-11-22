import React from "react";
import { theme } from "./theme";

export interface LoaderProps {
  progress: number;
}

export const Loader: React.FC<LoaderProps> = ({ progress }) => (
  <>
    <style>
      {`.wrapper {
    width: 250px;
    height: 24px;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid ${theme.primary.toString()};
  }
  .progress {
    background-color: ${theme.primary.toString()};
    height: 24px;
    width: 100%;
    transition: 500ms;
  }`}
    </style>
    <div className="wrapper">
      <div className="progress" style={{ maxWidth: `${progress * 100}%` }} />
    </div>
  </>
);
