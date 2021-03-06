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

import React, {FormEvent, ReactNode} from 'react';
import {Page} from "../../../../components/common/Page/";
import {Button, Card, Col, Form, Icon, Input, notification, Row, Tooltip} from "antd";
import {FormComponentProps} from "antd/lib/form";
import {RouteComponentProps} from "react-router";
import {FormButtonBar} from "../../../../components/common/FormButtonBar/";
import {injectAs} from "../../../../utils/mobx-utils";
import {SERVICES} from "../../../../services/ServiceConstants";
import {RestError} from "../../../../services/RestError";
import {DomainUserService} from "../../../../services/domain/DomainUserService";
import {DomainId} from "../../../../models/DomainId";
import {CreateDomainUserData} from "../../../../services/domain/common-rest-data";
import {toDomainRoute} from "../../../../utils/domain-url";
import styles from "./styles.module.css";

export interface CreateDomainUserProps extends RouteComponentProps {
  domainId: DomainId;
}

interface InjectedProps extends CreateDomainUserProps, FormComponentProps {
  domainUserService: DomainUserService;
}

export interface CreateDomainUserComponentState {
  confirmDirty: boolean;
}

class CreateDomainUserComponent extends React.Component<InjectedProps, CreateDomainUserComponentState> {
  private readonly _breadcrumbs = [
    {title: "Users", link: toDomainRoute(this.props.domainId, "users/")},
    {title: "New User"}
  ];

  constructor(props: InjectedProps) {
    super(props);

    this.state = {
      confirmDirty: false
    };
  }

  public render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    return (
      <Page breadcrumbs={this._breadcrumbs}>
        <Card title={<span><Icon type="user"/> New User</span>} className={styles.formCard}>
          <Form onSubmit={this._handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Username">
                  {getFieldDecorator('username', {
                    rules: [{
                      required: true, whitespace: true, message: 'Please input a Username!',
                    }],
                  })(
                    <Input/>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={(
                  <span>Display Name&nbsp;
                    <Tooltip title="What do you want others to call you?">
                  <Icon type="question-circle-o"/>
                </Tooltip>
                </span>
                )}>
                  {getFieldDecorator('displayName', {
                    rules: [{required: true, message: 'Please input a Display Name!', whitespace: true}],
                  })(
                    <Input/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="First Name">
                  {getFieldDecorator('firstName', {
                    rules: [{
                      required: false, whitespace: true, message: 'Please input a First Name!',
                    }],
                  })(
                    <Input/>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Last Name">
                  {getFieldDecorator('lastName', {
                    rules: [{
                      required: false, whitespace: true, message: 'Please input a Last Name!',
                    }],
                  })(
                    <Input/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="E-mail">
                  {getFieldDecorator('email', {
                    rules: [{
                      type: 'email', message: 'The input is not valid E-mail!',
                    }, {
                      required: false, message: 'Please input an E-mail!',
                    }],
                  })(
                    <Input/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Password">
                  {getFieldDecorator('password', {
                    rules: [{
                      required: true, message: 'Please input a password!',
                    }, {
                      validator: this.validateToNextPassword,
                    }],
                  })(
                    <Input type="password"/>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Confirm Password">
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: 'Please confirm the password!',
                    }, {
                      validator: this.compareToFirstPassword,
                    }],
                  })(
                    <Input type="password" onBlur={this.handleConfirmBlur}/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormButtonBar>
                  <Button htmlType="button" onClick={this._handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">Create</Button>
                </FormButtonBar>
              </Col>
            </Row>
          </Form>
        </Card>
      </Page>
    );
  }

  private _handleCancel = () => {
    const url = toDomainRoute(this.props.domainId, "users/");
    this.props.history.push(url);
  }

  private _handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values: any) => {
      if (!err) {
        const {username, displayName, firstName, lastName, email, password} = values;
        const userData: CreateDomainUserData = {
          username,
          displayName,
          firstName,
          lastName,
          email,
          password
        };
        this.props.domainUserService.createUser(this.props.domainId, userData)
          .then(() => {
            notification.success({
              message: 'User Created',
              description: `User '${username}' successfully created.`
            });
            const url = toDomainRoute(this.props.domainId, "users/");
            this.props.history.push(url);
          }).catch((err) => {
          if (err instanceof RestError) {
            if (err.code === "duplicate") {
              notification.error({
                message: 'Could Not Create User',
                description: `A user with the specified ${err.details["field"]} already exists.`
              });
            }
          }
        });
      }
    });
  }

  private handleConfirmBlur = (e: any) => {
    const value = e.target.value;
    this.setState({confirmDirty: this.state.confirmDirty || !!value});
  }

  private compareToFirstPassword = (rule: any, value: any, callback: (error?: string) => void) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('The passwords do not match!');
    } else {
      callback();
    }
  }

  private validateToNextPassword = (rule: any, value: any, callback: (error?: string) => void) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], {force: true});
    }
    callback();
  }
}

const injections = [SERVICES.DOMAIN_USER_SERVICE];
export const CreateDomainUser = injectAs<CreateDomainUserProps>(injections, Form.create()(CreateDomainUserComponent));
