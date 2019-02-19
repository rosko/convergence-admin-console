import React from 'react';
import {Page} from "../../../../components/Page/";
import {ReactNode} from "react";
import {Card, Tabs} from "antd";
import {Icon} from 'antd';
import styles from "./styles.module.css";
import {RouteComponentProps} from "react-router";
import {injectAs} from "../../../../utils/mobx-utils";
import {SERVICES} from "../../../../services/ServiceConstants";
import {DomainBreadcrumbProducer} from "../../DomainBreadcrumProducer";
import {DomainDescriptor} from "../../../../models/DomainDescriptor";
import {DomainModelService} from "../../../../services/domain/DomainModelService";
import {ModelEditorTab} from "./ModelEditorTab/";

interface EditDomainModelRouteProps {
  modelId: string;
}

interface EditDomainModelProps extends RouteComponentProps<EditDomainModelRouteProps> {
  domain: DomainDescriptor;
}

interface InjectedProps extends EditDomainModelProps {
  domainModelService: DomainModelService;
}

class EditDomainModelComponent extends React.Component<InjectedProps, {}> {
  private readonly _breadcrumbs: DomainBreadcrumbProducer;

  constructor(props: InjectedProps) {
    super(props);

    const id = this.props.match.params.modelId;

    this._breadcrumbs = new DomainBreadcrumbProducer([
      {title: "Models", link: "/models"},
      {title: id}
    ]);
  }

  public render(): ReactNode {
    this._breadcrumbs.setDomain(this.props.domain);
    return (
      <Page breadcrumbs={this._breadcrumbs.breadcrumbs()} full={true}>
        <Card title={this._renderTitle()} className={styles.formCard}>
          <Tabs className={styles.tabs} type="card">
            <Tabs.TabPane tab="Data" key="data">
              <ModelEditorTab modelId={this.props.match.params.modelId}/>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Permissions" key="permissions"/>
          </Tabs>
        </Card>
      </Page>
    );
  }

  private _renderTitle = () => {
    return (
      <span className={styles.title}>
        <span className={styles.editTitle}>
          <Icon type="file"/>
          <span> Edit Model</span>
        </span>
        <span className={styles.modelAndCollection}>
          <span className={styles.modelId}>{this.props.match.params.modelId}</span>
          <span className={styles.collectionId}>{"collection"}</span>
        </span>
      </span>
    );
  }
}

const injections = [SERVICES.DOMAIN_MODEL_SERVICE];
export const EditDomainModel = injectAs<EditDomainModelProps>(injections, EditDomainModelComponent);