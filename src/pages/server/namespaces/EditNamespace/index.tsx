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

import React, {FormEvent, ReactNode} from "react";
import {Page} from "../../../../components/common/Page/";
import {IBreadcrumbSegment} from "../../../../stores/BreacrumsStore";
import {Button, Card, Col, Form, Icon, Input, notification, Row} from "antd";
import {FormComponentProps} from "antd/lib/form";
import {RouteComponentProps} from "react-router";
import {FormButtonBar} from "../../../../components/common/FormButtonBar/";
import {injectAs} from "../../../../utils/mobx-utils";
import {SERVICES} from "../../../../services/ServiceConstants";
import {RestError} from "../../../../services/RestError";
import {NamespaceService} from "../../../../services/NamespaceService";
import {Namespace} from "../../../../models/Namespace";
import {UserRoleAdder} from "../../../../components/server/UserRoleAdder/";
import {UserRoleTable} from "../../../../components/server/UserRoleTable/";
import {RoleService, RoleTarget} from "../../../../services/RoleService";
import styles from "./styles.module.css";

interface InjectedProps extends RouteComponentProps, FormComponentProps {
  namespaceService: NamespaceService;
  roleService: RoleService;
}

export interface EditNamespaceState {
  namespace: Namespace | null;
  userRoles: Map<string, string>;
}

class EditNamespaceComponent extends React.Component<InjectedProps, EditNamespaceState> {
  private readonly _breadcrumbs: IBreadcrumbSegment[];

  private readonly _roles = ["Developer", "Domain Admin", "Owner"];

  constructor(props: InjectedProps) {
    super(props);

    this.state = {
      namespace: null,
      userRoles: new Map()
    };

    const namespaceId = (props.match.params as any).id;
    this._breadcrumbs = [
      {title: "Namespaces", link: "/namespaces"},
      {title: namespaceId}
    ];

    this.props.namespaceService.getNamespace(namespaceId).then(namespace => {
      this.setState({namespace});
      this._loadUserRoles();
    });
  }

  public render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    const {namespace} = this.state;
    if (namespace === null) {
      return <div/>;
    } else {
      return (
        <Page breadcrumbs={this._breadcrumbs}>
          <Card title={<span><Icon type="folder"/> Edit Namespace</span>} className={styles.formCard}>
            <Form onSubmit={this.handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Namespace Id">
                    {getFieldDecorator('id', {
                      initialValue: this.state.namespace!.id
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Display Name">
                    {getFieldDecorator('displayName', {
                      rules: [{required: true, message: 'Please input a Display Name!', whitespace: true}],
                      initialValue: this.state.namespace!.displayName
                    })(
                      <Input/>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormButtonBar>
                    <Button htmlType="button" onClick={this._handleCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Update</Button>
                  </FormButtonBar>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card className={styles.formCard}>
            <UserRoleAdder
              roles={this._roles}
              defaultRole="Developer"
              selectWidth={200}
              onAdd={this._setUserRole}/>
            <UserRoleTable
              roles={this._roles}
              userRoles={this.state.userRoles}
              onRemoveUser={this._onRemoveUserRole}
              onChangeRole={this._setUserRole}
            />
          </Card>
        </Page>
      );
    }
  }

  private _loadUserRoles(): void {
    this.props.roleService
      .getUserRoles(RoleTarget.namespace(this.state.namespace!.id))
      .then(userRoles => {
        this.setState({userRoles});
      });
  }

  private _onRemoveUserRole = (username: string) => {
    this.props.roleService
      .deleteUserRoles(RoleTarget.namespace(this.state.namespace!.id), username)
      .then(() => {
        const userRoles = new Map(this.state.userRoles);
        userRoles.delete(username);
        this.setState({userRoles});
        this._loadUserRoles();
      })
      .catch(err => {
        console.error(err);
        notification.error({
          message: 'Could Not Delete namespaces Role',
          description: `Could not delete role for the user.`,
        });
      });
  };

  private _setUserRole = (username: string, role: string) => {
    this.props.roleService
      .setUserRole(RoleTarget.namespace(this.state.namespace!.id), username, role)
      .then(() => {
        const userRoles = new Map(this.state.userRoles);
        userRoles.set(username, role);
        this.setState({userRoles});
        this._loadUserRoles();
      })
      .catch(err => {
        console.error(err);
        notification.error({
          message: 'Could Not Set namespaces Role',
          description: `Could not set role for the user.`,
        });
      });
  };

  private _handleCancel = () => {
    this.props.history.push("/namespaces/");
  };

  private handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values: any) => {
      if (!err) {
        const {id, displayName} = values;
        this.props.namespaceService.updateNamespace(id, displayName)
          .then(() => {
            notification.success({
              message: 'Namespace Updated',
              description: `Namespace '${id}' successfully updated`,
            });
            this.props.history.push("./");
          })
          .catch((err) => {
            let description = "Unknown error updating namespace.";
            if (err instanceof RestError) {
              if (err.code === "duplicate") {
                description = `A namespace with the specified ${err.details["field"]} already exists.`;
              }
            }

            notification.error({
              message: 'Could Not Update Namespace',
              description
            });
          });
      }
    });
  }
}

const injections = [SERVICES.NAMESPACE_SERVICE, SERVICES.ROLE_SERVICE];
export const EditNamespace = injectAs<RouteComponentProps>(injections, Form.create()(EditNamespaceComponent));
