import * as React from 'react';
import {ReactNode} from "react";
import {Button, Form, Input, Select} from "antd";
import {FormFieldWithHelp} from "../../../components/FormFieldWithHelp";
import {FormButtonBar} from "../../../components/FormButtonBar";
import {FormComponentProps} from "antd/lib/form";
import {FormEvent} from "react";

const {Option} = Select;

class NamespaceSettingsComponent extends React.Component<FormComponentProps, {}> {
  render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} layout="horizontal">
        <Form.Item label={(
          <FormFieldWithHelp
            label="Namespaces"
            tooltip="Determines if the server will allow grouping related domains into namespaces."
          />
        )}>
          {getFieldDecorator('namespaces', {
            rules: []
          })(
            <Select>
              <Option key="enabled" value="enabled">Enabled</Option>
              <Option key="disabled" value="disabled">Disabled</Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item label={(
          <FormFieldWithHelp
            label="User Namespaces"
            tooltip={
              `Determines if each user has an implicit namespace in which to create domains.
               This option requires namespaces to be enabled.`
            }
          />
        )}>
          {getFieldDecorator('userNamespaces', {
            rules: []
          })(
            <Select>
              <Option key="enabled" value="enabled">Enabled</Option>
              <Option key="disabled" value="disabled">Disabled</Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item label={(
          <FormFieldWithHelp
            label="Default Namespaces"
            tooltip={
              `The default namespace domains will be created in.
               This namespace will automatically be created and can not be deleted.
               This is a required field if namespaces are disabled.`
            }
          />
        )}>
          {getFieldDecorator('username', {
            rules: []
          })(
            <Input/>
          )}
        </Form.Item>
        <FormButtonBar>
          <Button type="primary" htmlType="submit">Save</Button>
        </FormButtonBar>
      </Form>
    );
  }

  private handleSubmit = (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
}

export const NamespaceSettings = Form.create<{}>()(NamespaceSettingsComponent);
