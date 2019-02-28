import React, {ReactNode} from "react";
import {Card, notification, Icon} from "antd";
import {FormComponentProps} from "antd/lib/form";
import styles from "./styles.module.css";
import {RouteComponentProps} from "react-router";
import {DomainId} from "../../../../../models/DomainId";
import {DomainJwtKeyService} from "../../../../../services/domain/DomainJwtKeyService";
import {DomainJwtKey} from "../../../../../models/domain/DomainJwtKey";
import {DomainBreadcrumbProducer} from "../../../DomainBreadcrumProducer";
import {makeCancelable, PromiseSubscription} from "../../../../../utils/make-cancelable";
import {toDomainUrl} from "../../../../../utils/domain-url";
import {SERVICES} from "../../../../../services/ServiceConstants";
import {injectAs} from "../../../../../utils/mobx-utils";
import {RestError} from "../../../../../services/RestError";
import {Page} from "../../../../../components/common/Page";
import {DomainJwtKeyForm} from "../../../../../components/domain/auth/DomainJwtKeyForm";

export interface EditDomainJwtKeyProps extends RouteComponentProps<{id: string}> {
  domainId: DomainId;
}

interface InjectedProps extends EditDomainJwtKeyProps, FormComponentProps {
  domainJwtKeyService: DomainJwtKeyService;
}

export interface EditDomainJwtKeyState {
  initialKey: DomainJwtKey | null;
}

class EditDomainJwtKeyComponent extends React.Component<InjectedProps, EditDomainJwtKeyState> {
  private readonly _breadcrumbs: DomainBreadcrumbProducer;
  private _keySubscription: PromiseSubscription | null;

  constructor(props: InjectedProps) {
    super(props);

    this._breadcrumbs = new DomainBreadcrumbProducer(this.props.domainId, [
      {title: "Authentication", link: toDomainUrl("", this.props.domainId, "authentication/")},
      {title: "JWT Keys", link: toDomainUrl("", this.props.domainId, "authentication/jwt")},
      {title: this.props.match.params.id}
    ]);

    this.state = {
      initialKey: null
    };

    this._keySubscription = null;
    this._loadKey();
  }

  public render(): ReactNode {
    if (this.state.initialKey !== null) {
      return (
        <Page breadcrumbs={this._breadcrumbs}>
          <Card title={<span><Icon type="key"/> Edit JWT Key</span>} className={styles.formCard}>
            <DomainJwtKeyForm
              disableId={true}
              domainId={this.props.domainId}
              saveButtonLabel="Save"
              initialValue={this.state.initialKey}
              onCancel={this._handleCancel}
              onSave={this._handleSave}
            />
          </Card>
        </Page>
      );
    } else {
      return null;
    }
  }

  private _handleCancel = () => {
    const url = toDomainUrl("", this.props.domainId, "authentication/jwt");
    this.props.history.push(url);
  }

  private _handleSave = (key: DomainJwtKey) => {
    this.props.domainJwtKeyService.updateKey(this.props.domainId, key)
      .then(() => {
        notification.success({
          message: 'Key Updated',
          description: `Key '${key.id}' successfully created.`
        });
        const url = toDomainUrl("", this.props.domainId, "authentication/jwt");
        this.props.history.push(url);
      }).catch((err) => {
      if (err instanceof RestError) {
        if (err.code === "duplicate") {
          notification.error({
            message: 'Could Not Edit Key',
            description: `A key with the specified ${err.details["field"]} already exists.`
          });
        }
      }
    });
  }

  private _loadKey(): void {
    const {id} = this.props.match.params;
    const {promise, subscription} = makeCancelable(
      this.props.domainJwtKeyService.getKey(this.props.domainId, id)
    );

    this._keySubscription = subscription;

    promise.then(key => {
      this.setState({initialKey: key});
    })
  }
}

const injections = [SERVICES.DOMAIN_JWT_KEY_SERVICE];
export const EditDomainJwtKey = injectAs<EditDomainJwtKeyProps>(injections, EditDomainJwtKeyComponent);