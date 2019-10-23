import * as React from 'react';
import {ReactNode} from "react";
import confirm from "antd/lib/modal/confirm";
import {Dropdown, Icon, Menu} from "antd";
import {Link} from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import { DomainModelService } from '../../../../services/domain/DomainModelService';
import {SERVICES} from "../../../../services/ServiceConstants";
import {injectAs} from "../../../../utils/mobx-utils";
import { DomainId } from '../../../../models/DomainId';
import { Model } from '../../../../models/domain/Model';
import {toDomainRoute} from "../../../../utils/domain-url";

interface ModelDropdownMenuProps {
  id: string;
  record: Model;
  domainId: DomainId;
  onDeleteConfirm: (id: string) => void;
}

interface InjectedProps extends ModelDropdownMenuProps {
  domainModelService: DomainModelService;
}

class ModelDropdownMenuComponent extends React.Component<InjectedProps, {}> {

  public render(): ReactNode {
    const permission = toDomainRoute(this.props.domainId, `models/${this.props.id}/permissions`);
    const data = toDomainRoute(this.props.domainId, `models/${this.props.id}`);
    const menu = (
      <Menu>
        <Menu.Item key="copyId">
          <CopyToClipboard text={this.props.id}>
            <span><Icon type="copy"/> Copy Id</span>
          </CopyToClipboard>
        </Menu.Item>
        <Menu.Item key="copyData">
          <CopyToClipboard text={JSON.stringify(this.props.record.data, null, "  ")}>
            <span><Icon type="copy"/> Copy Data</span>
          </CopyToClipboard>
        </Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="edit-data">
          <Link to={data}><Icon type="edit"/> Edit Model</Link>
        </Menu.Item>
        <Menu.Item key="edit-permissions">
          <Link to={permission}><Icon type="team"/> Edit Permissions</Link>
        </Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="delete">
          <span onClick={() => this._onContextDelete()}><Icon type="delete"/> Delete</span>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Icon type="down-square"/>
      </Dropdown>
    );
  }

  private _onContextDelete = () => {
    confirm({
      title: 'Delete Model?',
      content: 'Are you sure you want to delete this model?',
      okType: 'danger',
      onOk: () => {
        this.props.onDeleteConfirm(this.props.id);
      }
    });
  }
}

const injections = [SERVICES.DOMAIN_MODEL_SERVICE];
export const ModelDropdownMenu = injectAs<ModelDropdownMenuProps>(injections, ModelDropdownMenuComponent);