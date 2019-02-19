import React, {ReactNode} from 'react';
import {MenuItem} from "../menu/MenuItem";
import {MenuButton} from "./MenuButton";
import {ModelElementTypes} from "../../model/ModelElementTypes";
import {Subscription} from "rxjs";
import {TreeModel} from "../tree-editor/model/TreeModel";
import {ContainerNode} from "../tree-editor/model/ContainerNode";

export interface NewNodeButtonProps {
  treeModel: TreeModel;
}

export interface NewNodeButtonState {
  enabled: boolean;
}

export class NewNodeButton extends React.Component<NewNodeButtonProps, NewNodeButtonState> {
  private _treeSubscription: Subscription | null;

  constructor(props: NewNodeButtonProps) {
    super(props);
    this.state = {
      enabled: this._isEnabled()
    };

    this._treeSubscription = null;
  }

  public componentWillMount(): void {
    this._treeSubscription = this.props.treeModel.events().subscribe(() => {
      this.setState({ enabled: this._isEnabled()});
    });
  }

  public componentWillUnmount(): void {
    if (this._treeSubscription !== null) {
      this._treeSubscription.unsubscribe();
    }
  }

  newNode(type: string): void {
    this.props.treeModel.addToSelectedNode(type);
  }

  onNewObject = () => {
    this.newNode(ModelElementTypes.OBJECT);
  };

  onNewArray = () => {
    this.newNode(ModelElementTypes.ARRAY);
  };

  onNewString = () => {
    this.newNode(ModelElementTypes.STRING);
  };

  onNewNumber = () => {
    this.newNode(ModelElementTypes.NUMBER);
  };

  onNewBoolean = () => {
    this.newNode(ModelElementTypes.BOOLEAN);
  };

  onNewDate = () => {
    this.newNode(ModelElementTypes.DATE);
  };

  onNewNull = () => {
    this.newNode(ModelElementTypes.NULL);
  };

  private _isEnabled(): boolean {
    return this.props.treeModel.getSelection() instanceof ContainerNode && !this.props.treeModel.isAddingNode();
  }

  public render(): ReactNode {
    return (
      <MenuButton enabled={this.state.enabled} icon="plus">
        <MenuItem label="Object" onClick={this.onNewObject}/>
        <MenuItem label="Array" onClick={this.onNewArray}/>
        <MenuItem label="String" onClick={this.onNewString}/>
        <MenuItem label="Number" onClick={this.onNewNumber}/>
        <MenuItem label="Boolean" onClick={this.onNewBoolean}/>
        <MenuItem label="Date" onClick={this.onNewDate}/>
        <MenuItem label="Null" onClick={this.onNewNull}/>
      </MenuButton>
    );
  }
}
