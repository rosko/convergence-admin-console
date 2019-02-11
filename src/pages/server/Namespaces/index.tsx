import * as React from 'react';
import {Page} from "../../../components/Page/";
import {ReactNode} from "react";
import {BasicBreadcrumbsProducer} from "../../../stores/BreacrumStore";
import {Button, Card, Icon, Input, message, notification, Popconfirm, Table} from "antd";
import styles from "./styles.module.css";
import {injectAs} from "../../../utils/mobx-utils";
import {SERVICES} from "../../../services/ServiceConstants";
import {makeCancelable, PromiseSubscription} from "../../../utils/make-cancelable";
import {RouteComponentProps} from "react-router";
import {CartTitleToolbar} from "../../../components/CardTitleToolbar";
import Tooltip from "antd/es/tooltip";
import {NamespaceAndDomains} from "../../../models/NamespaceAndDomains";
import {NamespaceService} from "../../../services/NamespaceService";
import {Link} from "react-router-dom";

interface InjectedProps extends RouteComponentProps {
  namespaceService: NamespaceService;
}

interface NamespacesState {
  namespaces: NamespaceAndDomains[] | null;
}

export class NamespacesComponent extends React.Component<InjectedProps, NamespacesState> {
  private readonly breadcrumbs = new BasicBreadcrumbsProducer([{title: "Namespaces"}]);
  private readonly _namespaceTableColumns: any[];
  private _namepsacesSubscription: PromiseSubscription | null;

  constructor(props: InjectedProps) {
    super(props);

    this._namespaceTableColumns = [{
      title: 'Id',
      dataIndex: 'id',
      sorter: (a: any, b: any) => (a.id as string).localeCompare(b.id),
      render: (text: string) => <Link to={`/namespace/${text}`}>{text}</Link>
    }, {
      title: 'Display Name',
      dataIndex: 'displayName',
      sorter: (a: any, b: any) => (a.displayName as string).localeCompare(b.displayName),
    }, {
      title: 'Domains',
      dataIndex: 'domains',
      sorter: (a: any, b: any) => (a.id as string).localeCompare(b.id),
      render: (text: string, record: any) => record.domains.length
    }, {
      title: '',
      dataIndex: '',
      width: '50px',
      render: this._renderActions
    }];

    this._namepsacesSubscription = null;

    this.state = {
      namespaces: null
    };

    this._loadNamespaces();
  }

  public componentWillUnmount(): void {
    if (this._namepsacesSubscription) {
      this._namepsacesSubscription.unsubscribe();
    }
  }

  public render(): ReactNode {
    return (
      <Page breadcrumbs={this.breadcrumbs.breadcrumbs()}>
        <Card title={this._renderToolbar()}>
          <Table className={styles.userTable}
                 rowKey="id"
                 size="middle"
                 columns={this._namespaceTableColumns}
                 dataSource={this.state.namespaces || []}
          />
        </Card>
      </Page>
    );
  }

  private _renderToolbar(): ReactNode {
    return (
      <CartTitleToolbar title="Namespaces" icon="folder">
        <span className={styles.search}>
          <Input placeholder="Search Namespaces" addonAfter={<Icon type="search"/>}/>
        </span>
        <Tooltip placement="topRight" title="Create Namespace" mouseEnterDelay={1}>
          <Button className={styles.iconButton} shape="circle" size="small" htmlType="button"
                  onClick={this._goToCreate}>
            <Icon type="plus-circle"/>
          </Button>
        </Tooltip>
      </CartTitleToolbar>
    )
  }

  private _renderActions = (text: any, record: any) => {
    const deleteDisabled = false;
    const deleteButton = <Button shape="circle" size="small" htmlType="button" disabled={deleteDisabled}><Icon
      type="delete"/></Button>;

    const deleteComponent = deleteDisabled ?
      <Tooltip placement="topRight" title="You can not delete yourself!" mouseEnterDelay={1}>
        {deleteButton}
      </Tooltip> :
      <Popconfirm title={`Are you sure delete namespace '${record.id}'?`}
                  placement="topRight"
                  onConfirm={() => this._onDeleteNamespace(record.id)}
                  okText="Yes"
                  cancelText="No"
                  icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
      >
        <Tooltip placement="topRight" title="Delete Namespace" mouseEnterDelay={2}>
          {deleteButton}
        </Tooltip>
      </Popconfirm>

    return (<span className={styles.actions}>{deleteComponent}</span>);
  }


  private _onDeleteNamespace = (namespaceId: string) => {
    this.props.namespaceService.deleteNamespace(namespaceId)
      .then(() => {
        this._loadNamespaces();
        notification.success({
          message: 'Success',
          description: `Namespace '${namespaceId}' deleted.`,
          placement: "bottomRight",
          duration: 3
        });
      })
      .catch(err => {
        notification["error"]({
          message: 'Could Not Delete Namespace',
          description: `The namespace could not be deleted.`,
          placement: "bottomRight"
        });
      });
  }

  private _goToCreate = () => {
    this.props.history.push("/namespaces/create");
  }

  private _loadNamespaces(): void {
    const {promise, subscription} = makeCancelable(this.props.namespaceService.getNamespaces());
    this._namepsacesSubscription = subscription;
    promise.then(namespaces => {
      this._namepsacesSubscription = null;
      this.setState({namespaces});
    }).catch(err => {
      this._namepsacesSubscription = null;
      this.setState({namespaces: null});
    });
  }
}

export const Namespaces = injectAs<RouteComponentProps>([SERVICES.NAMESPACE_SERVICE], NamespacesComponent);