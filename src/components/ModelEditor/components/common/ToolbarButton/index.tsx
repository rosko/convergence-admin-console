/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence Server, which is released under
 * the terms of the GNU General Public License version 3 (GPLv3). A copy
 * of the GPLv3 should have been provided along with this file, typically
 * located in the "LICENSE" file, which is part of this source code package.
 * Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> for the
 * full text of the GPLv3 license, if it was not provided.
 */

import React, {ReactNode} from "react";
import styles from "./styles.module.scss";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

export interface ToolbarButtonProps {
  icon: IconProp;
  enabled: boolean;
  onClick: () => void;
}

export class ToolbarButton extends React.Component<ToolbarButtonProps, any> {
  public render(): ReactNode {
    const className = classNames(styles.toolbarButton, this.props.enabled ? styles.enabled : styles.disabled);
    return (
      <span className={className} onClick={this._onClick}>
        <FontAwesomeIcon size="sm" icon={this.props.icon}/>
      </span>
    );
  }

  private _onClick = () => {
    if (this.props.enabled) {
      this.props.onClick();
    }
  }
}
