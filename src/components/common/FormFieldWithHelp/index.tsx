import React, {ReactNode} from "react";
import styles from "./styles.module.css";
import {Icon, Tooltip} from "antd";

export interface FormFieldWithHelpProps {
  label: string;
  tooltip: string;
}

export class FormFieldWithHelp extends React.Component<FormFieldWithHelpProps, {}> {
  render(): ReactNode {
    return (
      <span>
        <span className={styles.label}>{this.props.label}</span>
        <Tooltip title={this.props.tooltip}><Icon className={styles.icon} type="question-circle-o"/></Tooltip>
      </span>
    );
  }
}