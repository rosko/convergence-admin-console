import React, {ReactNode, FormEvent} from "react";
import {
  Col,
  Row,
  Form,
  Input,
  Button,
  Checkbox,
} from "antd";
import {FormComponentProps} from "antd/lib/form";
import {UserApiKey} from "../../../models/UserApiKey";
import {FormButtonBar} from "../../common/FormButtonBar";

interface DomainCollectionFormProps {
  initialValue: UserApiKey;
  saveButtonLabel: string;

  onCancel(): void;

  onSave(data: {name: string, enabled: boolean}): void;
}

class ApiKeyFormComponent extends React.Component<DomainCollectionFormProps & FormComponentProps, {}> {
  public render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    const {initialValue} = this.props;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Name">
              {getFieldDecorator('name', {
                initialValue: initialValue.name,
                rules: [{
                  required: true, whitespace: true, message: 'Please input an API Key name!',
                }],
              })(
                <Input/>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            {getFieldDecorator('enabled', {
              initialValue: initialValue.enabled,
              valuePropName: 'checked'
            })(
              <Checkbox>Enabled</Checkbox>)}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormButtonBar>
              <Button htmlType="button" onClick={this._handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">{this.props.saveButtonLabel}</Button>
            </FormButtonBar>
          </Col>
        </Row>
      </Form>
    );
  }

  private _handleCancel = () => {
    this.props.onCancel();
  }

  private _handleSubmit = (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values: any) => {
      if (!err) {
        const {name, enabled} = values;
        this.props.onSave({name, enabled});
      }
    });
  }
}

export const ApiKeyForm = Form.create<{}>()(ApiKeyFormComponent)