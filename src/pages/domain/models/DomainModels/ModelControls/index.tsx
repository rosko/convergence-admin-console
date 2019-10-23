import * as React from 'react';
import {ReactNode} from "react";
import {Input, InputNumber, Select} from "antd";
import {Form, Button} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {CollectionAutoComplete} from "../../../../../components/domain/collection/CollectionAutoComplete";
import {DomainId} from "../../../../../models/DomainId";
import styles from "./styles.module.css";
import {IReactComponent} from "mobx-react";
import { createQueryParamString, appendtoQueryParamString } from '../../../../../utils/router-utils';
import { History } from 'history';

const {Option} = Select;

export enum ModelSearchMode {
  BROWSE = "browse",
  QUERY = "query",
  ID = "id",
}

interface ModelControlsProps {
  domainId: DomainId;
  pageSize: number;
  history: History;
  searchMode: ModelSearchMode;
  submittedQueryInput?: string;
}

interface InjectedProps extends ModelControlsProps, FormComponentProps {

}

class ModelControlsComponent extends React.Component<InjectedProps, {}> {

  public render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    const mode = this.props.searchMode;
    const queryInput = this.props.submittedQueryInput || '';
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
          {
            <Select style={{width: 150}} onChange={this._handleModeChange} value={mode}>
              <Option key={ModelSearchMode.BROWSE} value={ModelSearchMode.BROWSE}>Browse</Option>
              <Option key={ModelSearchMode.QUERY} value={ModelSearchMode.QUERY}>Query</Option>
              <Option key={ModelSearchMode.ID} value={ModelSearchMode.ID}>Id Lookup</Option>
            </Select>
          }
        </div>
        <span className={styles.label}>{fieldLabel}:</span>
        {
          mode === ModelSearchMode.BROWSE ?
            getFieldDecorator('collection', {initialValue: queryInput})(
              <CollectionAutoComplete initialValue={queryInput} className={styles.collection} domainId={this.props.domainId} />
            ) : null
        }
        {
          mode === ModelSearchMode.QUERY ?
            getFieldDecorator('query', {initialValue: queryInput})(
              <Input className={styles.query} placeholder="Enter Query"/>
            ) : null
        }
        {
          mode === ModelSearchMode.ID ?
            getFieldDecorator('id', {initialValue: queryInput})(
              <Input className={styles.id} placeholder="Enter Model Id"/>
            ) : null
        }
        {
          mode === ModelSearchMode.BROWSE ?
            <span>
              <span className={styles.label}>Results Per Page:</span>
              {getFieldDecorator('resultsPerPage', {initialValue: this.props.pageSize})(
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

  private _handleModeChange = (mode: ModelSearchMode) => {
    let newUrl = createQueryParamString({mode});
    this.props.history.push(newUrl);
  }

  private _handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const {collection, id, resultsPerPage} = values;
        const mode = this.props.searchMode;
        let newUrl = null;

        switch (mode) {
          case "browse":
            // todo just update the url query params
            // this.props.onBrowse(collection, resultsPerPage);
            newUrl = appendtoQueryParamString({
              collection, pageSize: resultsPerPage
            });
            break;
          case "query": {
            let {query} = values;
            if (query.endsWith(";")) {
              query = query.substring(0, query.length - 1);
            }
            newUrl = appendtoQueryParamString({query});
            break;
          }
          case "id":
            newUrl = appendtoQueryParamString({id});
            break;
        }

        if (newUrl != null) {
          this.props.history.push(newUrl);
        }
      }
    });
  }
}

export const ModelControls = Form.create<{}>()(ModelControlsComponent) as IReactComponent<ModelControlsProps>;