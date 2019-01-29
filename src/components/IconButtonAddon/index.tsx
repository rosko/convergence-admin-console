import * as React from 'react';
import {Component, ReactNode} from "react";
import styles from "./styles.module.css";
import {Button} from "antd";

export interface IconButtonAddonProps {
  icon: string;
  onClick?: (e: any) => void
}

export class IconButtonAddon extends Component<IconButtonAddonProps, {}> {
  public render(): ReactNode {
    return (
      <Button onClick={this.props.onClick}
              className={styles.iconButton}
              icon={this.props.icon}
              htmlType="button"
      />
    );
  }
}
