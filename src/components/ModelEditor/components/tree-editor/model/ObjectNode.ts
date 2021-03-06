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

import {
  ObjectElement,
  ObjectElementRemoveEvent,
  ObjectElementRenameEvent,
  ObjectElementSetEvent,
  ObjectElementValueEvent
} from "../../../model/ObjectElement";
import {ContainerNode} from "./ContainerNode";
import {TreeNode} from "./TreeNode";
import {createTreeNode} from "./TreeNodeFactory";
import {TreeModel} from "./TreeModel";
import {ModelElement, ModelElementEvent} from "../../../model/ModelElement";
import {ModelPath, ModelPathElement} from "../../../model/ModelPath";

export class ObjectNode extends ContainerNode<ObjectElement> {

  private _children: Map<string, TreeNode<any>>;

  constructor(tree: TreeModel, parent: ContainerNode<any> | null, data: ObjectElement, selected: boolean, expanded: boolean) {
    super(tree, parent, data, selected, expanded);

    this._children = new Map();
    data.forEach((k: string, v: ModelElement<any>) => this._children.set(k, createTreeNode(tree, this, v)));
  }

  public size(): number {
    return this.element().size();
  }

  public forEach(callback: (key: string, value: TreeNode<any>) => void) {
    this._children.forEach((v: TreeNode<any>, k: string) => callback(k, v));
  }

  public getNodeAtPath(path: ModelPath): TreeNode<any> | null {
    if (path.length === 0) {
      return this;
    } else {
      const relPath = path.slice(0);
      const key: ModelPathElement = relPath.shift()!;
      if (typeof key === "string") {
        const child: TreeNode<any> = this._children.get(key as string)!;
        return child.getNodeAtPath(relPath);
      } else {
        throw new Error("Incorrect elementPath element type for ObjectNode: " + key)
      }
    }
  }

  public removeChild(child: TreeNode<any>): void {
    this.element().remove(child.element().relativePathFromParent());
  }

  protected _handleElementEvent(e: ModelElementEvent): void {
    if (e instanceof ObjectElementSetEvent) {
      this._children.set(e.key, createTreeNode(this.tree(), this, e.value));
      this._emitChanged();
    } else if (e instanceof ObjectElementRemoveEvent) {
      this._children.delete(e.key);
      this._emitChanged();
    } else if (e instanceof ObjectElementRenameEvent) {
      const current = this._children.get(e.oldKey)!;
      this._children.delete(e.oldKey);
      this._children.set(e.newKey, current);
      this._emitChanged();
    } else if (e instanceof ObjectElementValueEvent) {
      this._children = new Map();
      this.element().forEach((k: string, v: ModelElement<any>) => this._children.set(k, createTreeNode(this.tree(), this, v)));
      this._emitChanged();
    }
  }
}
