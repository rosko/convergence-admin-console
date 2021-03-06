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
import * as React from 'react';
import {ReactElement} from 'react';
import {Button, Form, Input, InputNumber, Select} from "antd";
import {FormComponentProps} from "antd/lib/form";
import {CollectionAutoComplete} from "../../../../../components/domain/collection/CollectionAutoComplete";
import {DomainId} from "../../../../../models/DomainId";
import styles from "./styles.module.css";
import {FormCreateOption} from "antd/es/form";
import {ModelSearchMode} from "../ModelSearchMode";

const {Option} = Select;

interface ModelControlsProps extends  FormComponentProps {
  initialMode?: ModelSearchMode;
  initialData?: string;
  domainId: DomainId;
  resultsPerPageDefault: number;
  onModeChange(mode: ModelSearchMode): void;
  onBrowse(collection: string, perPage: number): void;
  onQuery(query: string, perPage: number): void;
  onIdLookup(modelId: string, perPage: number): void;
}

class ModelControlsComponent extends React.Component<ModelControlsProps, {}> {

  public render(): ReactElement {
    const {getFieldDecorator} = this.props.form;
    const mode = this.props.form.getFieldValue("mode") as ModelSearchMode || ModelSearchMode.BROWSE;
    let fieldLabel = "";
    let buttonLabel = "";
    switch (mode) {
      case ModelSearchMode.BROWSE:
        fieldLabel = "Collection";
        buttonLabel = "Browse";
        break;
      case ModelSearchMode.QUERY:
        fieldLabel = "Query";
        buttonLabel = "Query";
        break;
      case ModelSearchMode.ID:
        fieldLabel = "Model Id";
        buttonLabel = "Search";
        break;
    }

    return (
      <div className={styles.toolbar}>
        <div className={styles.modeSelector}>
          <span className={styles.label}>Mode:</span>
          {getFieldDecorator('mode', {initialValue: this.props.initialMode || ModelSearchMode.BROWSE})(
            <Select style={{width: 150}} onChange={this.props.onModeChange}>
              <Option key={ModelSearchMode.BROWSE} value={ModelSearchMode.BROWSE}>Browse</Option>
              <Option key={ModelSearchMode.QUERY} value={ModelSearchMode.QUERY}>Query</Option>
              <Option key={ModelSearchMode.ID} value={ModelSearchMode.ID}>Id Lookup</Option>
            </Select>
          )}
        </div>
        <span className={styles.label}>{fieldLabel}:</span>
        {
          mode === ModelSearchMode.BROWSE ?
            getFieldDecorator('collection', {initialValue: this.props.initialData})(
              <CollectionAutoComplete initialValue={this.props.initialData} className={styles.collection} domainId={this.props.domainId} />
            ) : null
        }
        {
          mode === ModelSearchMode.QUERY ?
            getFieldDecorator('query', {initialValue: this.props.initialData})(
              <Input className={styles.query} placeholder="Enter Query"/>
            ) : null
        }
        {
          mode === ModelSearchMode.ID ?
            getFieldDecorator('id', {initialValue: this.props.initialData})(
              <Input className={styles.id} placeholder="Enter Model Id"/>
            ) : null
        }
        {
          mode === ModelSearchMode.BROWSE ?
            <span>
              <span className={styles.label}>Results Per Page:</span>
              {getFieldDecorator('resultsPerPage', {initialValue: this.props.resultsPerPageDefault || 20})(
                <InputNumber/>
              )}
            </span>: null
        }
        <Button htmlType="button"
                type="primary"
                className={styles.button}
                onClick={this._handleSubmit}>{buttonLabel}</Button>
      </div>
    );
  }

  private _handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const {mode, collection, query, id, resultsPerPage} = values;
        switch (mode) {
          case ModelSearchMode.BROWSE:
            this.props.onBrowse(collection, resultsPerPage);
            break;
          case ModelSearchMode.QUERY:
            this.props.onQuery(query, resultsPerPage);
            break;
          case ModelSearchMode.ID:
            this.props.onIdLookup(id, resultsPerPage);
            break;
        }
      }
    });
  }
}

const formOptions: FormCreateOption<ModelControlsProps> = { };
export const ModelControls = Form.create(formOptions)(ModelControlsComponent);
