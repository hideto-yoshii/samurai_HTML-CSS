/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/model/textModel", "vs/platform/clipboard/common/clipboardService", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/common/instantiation", "./snippetParser", "./snippetVariables", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/types", "vs/platform/label/common/label", "vs/css!./snippetSession"], function (require, exports, arrays_1, lifecycle_1, strings_1, editOperation_1, range_1, selection_1, textModel_1, clipboardService_1, workspace_1, instantiation_1, snippetParser_1, snippetVariables_1, themeService_1, colors, types_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    themeService_1.registerThemingParticipant((theme, collector) => {
        function getColorGraceful(name) {
            const color = theme.getColor(name);
            return color ? color.toString() : 'transparent';
        }
        collector.addRule(`.monaco-editor .snippet-placeholder { background-color: ${getColorGraceful(colors.snippetTabstopHighlightBackground)}; outline-color: ${getColorGraceful(colors.snippetTabstopHighlightBorder)}; }`);
        collector.addRule(`.monaco-editor .finish-snippet-placeholder { background-color: ${getColorGraceful(colors.snippetFinalTabstopHighlightBackground)}; outline-color: ${getColorGraceful(colors.snippetFinalTabstopHighlightBorder)}; }`);
    });
    class OneSnippet {
        constructor(editor, snippet, offset) {
            this._nestingLevel = 1;
            this._editor = editor;
            this._snippet = snippet;
            this._offset = offset;
            this._placeholderGroups = arrays_1.groupBy(snippet.placeholders, snippetParser_1.Placeholder.compareByIndex);
            this._placeholderGroupsIdx = -1;
        }
        dispose() {
            if (this._placeholderDecorations) {
                let toRemove = [];
                this._placeholderDecorations.forEach(handle => toRemove.push(handle));
                this._editor.deltaDecorations(toRemove, []);
            }
            this._placeholderGroups.length = 0;
        }
        _initDecorations() {
            if (this._placeholderDecorations) {
                // already initialized
                return;
            }
            this._placeholderDecorations = new Map();
            const model = this._editor.getModel();
            this._editor.changeDecorations(accessor => {
                // create a decoration for each placeholder
                for (const placeholder of this._snippet.placeholders) {
                    const placeholderOffset = this._snippet.offset(placeholder);
                    const placeholderLen = this._snippet.fullLen(placeholder);
                    const range = range_1.Range.fromPositions(model.getPositionAt(this._offset + placeholderOffset), model.getPositionAt(this._offset + placeholderOffset + placeholderLen));
                    const options = placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive;
                    const handle = accessor.addDecoration(range, options);
                    this._placeholderDecorations.set(placeholder, handle);
                }
            });
        }
        move(fwd) {
            if (!this._editor.hasModel()) {
                return [];
            }
            this._initDecorations();
            // Transform placeholder text if necessary
            if (this._placeholderGroupsIdx >= 0) {
                let operations = [];
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    // Check if the placeholder has a transformation
                    if (placeholder.transform) {
                        const id = this._placeholderDecorations.get(placeholder);
                        const range = this._editor.getModel().getDecorationRange(id);
                        const currentValue = this._editor.getModel().getValueInRange(range);
                        operations.push(editOperation_1.EditOperation.replaceMove(range, placeholder.transform.resolve(currentValue)));
                    }
                }
                if (operations.length > 0) {
                    this._editor.executeEdits('snippet.placeholderTransform', operations);
                }
            }
            let couldSkipThisPlaceholder = false;
            if (fwd === true && this._placeholderGroupsIdx < this._placeholderGroups.length - 1) {
                this._placeholderGroupsIdx += 1;
                couldSkipThisPlaceholder = true;
            }
            else if (fwd === false && this._placeholderGroupsIdx > 0) {
                this._placeholderGroupsIdx -= 1;
                couldSkipThisPlaceholder = true;
            }
            else {
                // the selection of the current placeholder might
                // not acurate any more -> simply restore it
            }
            const newSelections = this._editor.getModel().changeDecorations(accessor => {
                const activePlaceholders = new Set();
                // change stickiness to always grow when typing at its edges
                // because these decorations represent the currently active
                // tabstop.
                // Special case #1: reaching the final tabstop
                // Special case #2: placeholders enclosing active placeholders
                const selections = [];
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    const id = this._placeholderDecorations.get(placeholder);
                    const range = this._editor.getModel().getDecorationRange(id);
                    selections.push(new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn));
                    // consider to skip this placeholder index when the decoration
                    // range is empty but when the placeholder wasn't. that's a strong
                    // hint that the placeholder has been deleted. (all placeholder must match this)
                    couldSkipThisPlaceholder = couldSkipThisPlaceholder && this._hasPlaceholderBeenCollapsed(placeholder);
                    accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
                    activePlaceholders.add(placeholder);
                    for (const enclosingPlaceholder of this._snippet.enclosingPlaceholders(placeholder)) {
                        const id = this._placeholderDecorations.get(enclosingPlaceholder);
                        accessor.changeDecorationOptions(id, enclosingPlaceholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
                        activePlaceholders.add(enclosingPlaceholder);
                    }
                }
                // change stickness to never grow when typing at its edges
                // so that in-active tabstops never grow
                this._placeholderDecorations.forEach((id, placeholder) => {
                    if (!activePlaceholders.has(placeholder)) {
                        accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive);
                    }
                });
                return selections;
            });
            return !couldSkipThisPlaceholder ? newSelections : this.move(fwd);
        }
        _hasPlaceholderBeenCollapsed(placeholder) {
            // A placeholder is empty when it wasn't empty when authored but
            // when its tracking decoration is empty. This also applies to all
            // potential parent placeholders
            let marker = placeholder;
            while (marker) {
                if (marker instanceof snippetParser_1.Placeholder) {
                    const id = this._placeholderDecorations.get(marker);
                    const range = this._editor.getModel().getDecorationRange(id);
                    if (range.isEmpty() && marker.toString().length > 0) {
                        return true;
                    }
                }
                marker = marker.parent;
            }
            return false;
        }
        get isAtFirstPlaceholder() {
            return this._placeholderGroupsIdx <= 0 || this._placeholderGroups.length === 0;
        }
        get isAtLastPlaceholder() {
            return this._placeholderGroupsIdx === this._placeholderGroups.length - 1;
        }
        get hasPlaceholder() {
            return this._snippet.placeholders.length > 0;
        }
        computePossibleSelections() {
            const result = new Map();
            for (const placeholdersWithEqualIndex of this._placeholderGroups) {
                let ranges;
                for (const placeholder of placeholdersWithEqualIndex) {
                    if (placeholder.isFinalTabstop) {
                        // ignore those
                        break;
                    }
                    if (!ranges) {
                        ranges = [];
                        result.set(placeholder.index, ranges);
                    }
                    const id = this._placeholderDecorations.get(placeholder);
                    const range = this._editor.getModel().getDecorationRange(id);
                    if (!range) {
                        // one of the placeholder lost its decoration and
                        // therefore we bail out and pretend the placeholder
                        // (with its mirrors) doesn't exist anymore.
                        result.delete(placeholder.index);
                        break;
                    }
                    ranges.push(range);
                }
            }
            return result;
        }
        get choice() {
            return this._placeholderGroups[this._placeholderGroupsIdx][0].choice;
        }
        merge(others) {
            const model = this._editor.getModel();
            this._nestingLevel *= 10;
            this._editor.changeDecorations(accessor => {
                // For each active placeholder take one snippet and merge it
                // in that the placeholder (can be many for `$1foo$1foo`). Because
                // everything is sorted by editor selection we can simply remove
                // elements from the beginning of the array
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    const nested = others.shift();
                    console.assert(!nested._placeholderDecorations);
                    // Massage placeholder-indicies of the nested snippet to be
                    // sorted right after the insertion point. This ensures we move
                    // through the placeholders in the correct order
                    const indexLastPlaceholder = nested._snippet.placeholderInfo.last.index;
                    for (const nestedPlaceholder of nested._snippet.placeholderInfo.all) {
                        if (nestedPlaceholder.isFinalTabstop) {
                            nestedPlaceholder.index = placeholder.index + ((indexLastPlaceholder + 1) / this._nestingLevel);
                        }
                        else {
                            nestedPlaceholder.index = placeholder.index + (nestedPlaceholder.index / this._nestingLevel);
                        }
                    }
                    this._snippet.replace(placeholder, nested._snippet.children);
                    // Remove the placeholder at which position are inserting
                    // the snippet and also remove its decoration.
                    const id = this._placeholderDecorations.get(placeholder);
                    accessor.removeDecoration(id);
                    this._placeholderDecorations.delete(placeholder);
                    // For each *new* placeholder we create decoration to monitor
                    // how and if it grows/shrinks.
                    for (const placeholder of nested._snippet.placeholders) {
                        const placeholderOffset = nested._snippet.offset(placeholder);
                        const placeholderLen = nested._snippet.fullLen(placeholder);
                        const range = range_1.Range.fromPositions(model.getPositionAt(nested._offset + placeholderOffset), model.getPositionAt(nested._offset + placeholderOffset + placeholderLen));
                        const handle = accessor.addDecoration(range, OneSnippet._decor.inactive);
                        this._placeholderDecorations.set(placeholder, handle);
                    }
                }
                // Last, re-create the placeholder groups by sorting placeholders by their index.
                this._placeholderGroups = arrays_1.groupBy(this._snippet.placeholders, snippetParser_1.Placeholder.compareByIndex);
            });
        }
        getEnclosingRange() {
            let result;
            const model = this._editor.getModel();
            this._placeholderDecorations.forEach((decorationId) => {
                const placeholderRange = types_1.withNullAsUndefined(model.getDecorationRange(decorationId));
                if (!result) {
                    result = placeholderRange;
                }
                else {
                    result = result.plusRange(placeholderRange);
                }
            });
            return result;
        }
    }
    exports.OneSnippet = OneSnippet;
    OneSnippet._decor = {
        active: textModel_1.ModelDecorationOptions.register({ stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
        inactive: textModel_1.ModelDecorationOptions.register({ stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
        activeFinal: textModel_1.ModelDecorationOptions.register({ stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
        inactiveFinal: textModel_1.ModelDecorationOptions.register({ stickiness: 1 /* NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
    };
    const _defaultOptions = {
        overwriteBefore: 0,
        overwriteAfter: 0,
        adjustWhitespace: true,
        clipboardText: undefined
    };
    class SnippetSession {
        constructor(editor, template, options = _defaultOptions) {
            this._templateMerges = [];
            this._snippets = [];
            this._editor = editor;
            this._template = template;
            this._options = options;
        }
        static adjustWhitespace(model, position, snippet, adjustIndentation, adjustNewlines) {
            const line = model.getLineContent(position.lineNumber);
            const lineLeadingWhitespace = strings_1.getLeadingWhitespace(line, 0, position.column - 1);
            snippet.walk(marker => {
                if (marker instanceof snippetParser_1.Text && !(marker.parent instanceof snippetParser_1.Choice)) {
                    // adjust indentation of text markers, except for choise elements
                    // which get adjusted when being selected
                    const lines = marker.value.split(/\r\n|\r|\n/);
                    if (adjustIndentation) {
                        for (let i = 1; i < lines.length; i++) {
                            let templateLeadingWhitespace = strings_1.getLeadingWhitespace(lines[i]);
                            lines[i] = model.normalizeIndentation(lineLeadingWhitespace + templateLeadingWhitespace) + lines[i].substr(templateLeadingWhitespace.length);
                        }
                    }
                    if (adjustNewlines) {
                        const newValue = lines.join(model.getEOL());
                        if (newValue !== marker.value) {
                            marker.parent.replace(marker, [new snippetParser_1.Text(newValue)]);
                        }
                    }
                }
                return true;
            });
        }
        static adjustSelection(model, selection, overwriteBefore, overwriteAfter) {
            if (overwriteBefore !== 0 || overwriteAfter !== 0) {
                // overwrite[Before|After] is compute using the position, not the whole
                // selection. therefore we adjust the selection around that position
                const { positionLineNumber, positionColumn } = selection;
                const positionColumnBefore = positionColumn - overwriteBefore;
                const positionColumnAfter = positionColumn + overwriteAfter;
                const range = model.validateRange({
                    startLineNumber: positionLineNumber,
                    startColumn: positionColumnBefore,
                    endLineNumber: positionLineNumber,
                    endColumn: positionColumnAfter
                });
                selection = selection_1.Selection.createWithDirection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn, selection.getDirection());
            }
            return selection;
        }
        static createEditsAndSnippets(editor, template, overwriteBefore, overwriteAfter, enforceFinalTabstop, adjustWhitespace, clipboardText) {
            const edits = [];
            const snippets = [];
            if (!editor.hasModel()) {
                return { edits, snippets };
            }
            const model = editor.getModel();
            const workspaceService = editor.invokeWithinContext(accessor => accessor.get(workspace_1.IWorkspaceContextService, instantiation_1.optional));
            const modelBasedVariableResolver = editor.invokeWithinContext(accessor => new snippetVariables_1.ModelBasedVariableResolver(accessor.get(label_1.ILabelService, instantiation_1.optional), model));
            const clipboardService = editor.invokeWithinContext(accessor => accessor.get(clipboardService_1.IClipboardService, instantiation_1.optional));
            const readClipboardText = () => clipboardText || clipboardService && clipboardService.readTextSync();
            let delta = 0;
            // know what text the overwrite[Before|After] extensions
            // of the primary curser have selected because only when
            // secondary selections extend to the same text we can grow them
            let firstBeforeText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), overwriteBefore, 0));
            let firstAfterText = model.getValueInRange(SnippetSession.adjustSelection(model, editor.getSelection(), 0, overwriteAfter));
            // remember the first non-whitespace column to decide if
            // `keepWhitespace` should be overruled for secondary selections
            let firstLineFirstNonWhitespace = model.getLineFirstNonWhitespaceColumn(editor.getSelection().positionLineNumber);
            // sort selections by their start position but remeber
            // the original index. that allows you to create correct
            // offset-based selection logic without changing the
            // primary selection
            const indexedSelections = editor.getSelections()
                .map((selection, idx) => ({ selection, idx }))
                .sort((a, b) => range_1.Range.compareRangesUsingStarts(a.selection, b.selection));
            for (const { selection, idx } of indexedSelections) {
                // extend selection with the `overwriteBefore` and `overwriteAfter` and then
                // compare if this matches the extensions of the primary selection
                let extensionBefore = SnippetSession.adjustSelection(model, selection, overwriteBefore, 0);
                let extensionAfter = SnippetSession.adjustSelection(model, selection, 0, overwriteAfter);
                if (firstBeforeText !== model.getValueInRange(extensionBefore)) {
                    extensionBefore = selection;
                }
                if (firstAfterText !== model.getValueInRange(extensionAfter)) {
                    extensionAfter = selection;
                }
                // merge the before and after selection into one
                const snippetSelection = selection
                    .setStartPosition(extensionBefore.startLineNumber, extensionBefore.startColumn)
                    .setEndPosition(extensionAfter.endLineNumber, extensionAfter.endColumn);
                const snippet = new snippetParser_1.SnippetParser().parse(template, true, enforceFinalTabstop);
                // adjust the template string to match the indentation and
                // whitespace rules of this insert location (can be different for each cursor)
                // happens when being asked for (default) or when this is a secondary
                // cursor and the leading whitespace is different
                const start = snippetSelection.getStartPosition();
                SnippetSession.adjustWhitespace(model, start, snippet, adjustWhitespace || (idx > 0 && firstLineFirstNonWhitespace !== model.getLineFirstNonWhitespaceColumn(selection.positionLineNumber)), true);
                snippet.resolveVariables(new snippetVariables_1.CompositeSnippetVariableResolver([
                    modelBasedVariableResolver,
                    new snippetVariables_1.ClipboardBasedVariableResolver(readClipboardText, idx, indexedSelections.length, editor.getOption(57 /* multiCursorPaste */) === 'spread'),
                    new snippetVariables_1.SelectionBasedVariableResolver(model, selection),
                    new snippetVariables_1.CommentBasedVariableResolver(model),
                    new snippetVariables_1.TimeBasedVariableResolver,
                    new snippetVariables_1.WorkspaceBasedVariableResolver(workspaceService),
                    new snippetVariables_1.RandomBasedVariableResolver,
                ]));
                const offset = model.getOffsetAt(start) + delta;
                delta += snippet.toString().length - model.getValueLengthInRange(snippetSelection);
                // store snippets with the index of their originating selection.
                // that ensures the primiary cursor stays primary despite not being
                // the one with lowest start position
                edits[idx] = editOperation_1.EditOperation.replace(snippetSelection, snippet.toString());
                snippets[idx] = new OneSnippet(editor, snippet, offset);
            }
            return { edits, snippets };
        }
        dispose() {
            lifecycle_1.dispose(this._snippets);
        }
        _logInfo() {
            return `template="${this._template}", merged_templates="${this._templateMerges.join(' -> ')}"`;
        }
        insert() {
            if (!this._editor.hasModel()) {
                return;
            }
            // make insert edit and start with first selections
            const { edits, snippets } = SnippetSession.createEditsAndSnippets(this._editor, this._template, this._options.overwriteBefore, this._options.overwriteAfter, false, this._options.adjustWhitespace, this._options.clipboardText);
            this._snippets = snippets;
            this._editor.executeEdits('snippet', edits, undoEdits => {
                if (this._snippets[0].hasPlaceholder) {
                    return this._move(true);
                }
                else {
                    return undoEdits.map(edit => selection_1.Selection.fromPositions(edit.range.getEndPosition()));
                }
            });
            this._editor.revealRange(this._editor.getSelections()[0]);
        }
        merge(template, options = _defaultOptions) {
            if (!this._editor.hasModel()) {
                return;
            }
            this._templateMerges.push([this._snippets[0]._nestingLevel, this._snippets[0]._placeholderGroupsIdx, template]);
            const { edits, snippets } = SnippetSession.createEditsAndSnippets(this._editor, template, options.overwriteBefore, options.overwriteAfter, true, options.adjustWhitespace, options.clipboardText);
            this._editor.executeEdits('snippet', edits, undoEdits => {
                for (const snippet of this._snippets) {
                    snippet.merge(snippets);
                }
                console.assert(snippets.length === 0);
                if (this._snippets[0].hasPlaceholder) {
                    return this._move(undefined);
                }
                else {
                    return undoEdits.map(edit => selection_1.Selection.fromPositions(edit.range.getEndPosition()));
                }
            });
        }
        next() {
            const newSelections = this._move(true);
            this._editor.setSelections(newSelections);
            this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        prev() {
            const newSelections = this._move(false);
            this._editor.setSelections(newSelections);
            this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        _move(fwd) {
            const selections = [];
            for (const snippet of this._snippets) {
                const oneSelection = snippet.move(fwd);
                selections.push(...oneSelection);
            }
            return selections;
        }
        get isAtFirstPlaceholder() {
            return this._snippets[0].isAtFirstPlaceholder;
        }
        get isAtLastPlaceholder() {
            return this._snippets[0].isAtLastPlaceholder;
        }
        get hasPlaceholder() {
            return this._snippets[0].hasPlaceholder;
        }
        get choice() {
            return this._snippets[0].choice;
        }
        isSelectionWithinPlaceholders() {
            if (!this.hasPlaceholder) {
                return false;
            }
            const selections = this._editor.getSelections();
            if (selections.length < this._snippets.length) {
                // this means we started snippet mode with N
                // selections and have M (N > M) selections.
                // So one snippet is without selection -> cancel
                return false;
            }
            let allPossibleSelections = new Map();
            for (const snippet of this._snippets) {
                const possibleSelections = snippet.computePossibleSelections();
                // for the first snippet find the placeholder (and its ranges)
                // that contain at least one selection. for all remaining snippets
                // the same placeholder (and their ranges) must be used.
                if (allPossibleSelections.size === 0) {
                    possibleSelections.forEach((ranges, index) => {
                        ranges.sort(range_1.Range.compareRangesUsingStarts);
                        for (const selection of selections) {
                            if (ranges[0].containsRange(selection)) {
                                allPossibleSelections.set(index, []);
                                break;
                            }
                        }
                    });
                }
                if (allPossibleSelections.size === 0) {
                    // return false if we couldn't associate a selection to
                    // this (the first) snippet
                    return false;
                }
                // add selections from 'this' snippet so that we know all
                // selections for this placeholder
                allPossibleSelections.forEach((array, index) => {
                    array.push(...possibleSelections.get(index));
                });
            }
            // sort selections (and later placeholder-ranges). then walk both
            // arrays and make sure the placeholder-ranges contain the corresponding
            // selection
            selections.sort(range_1.Range.compareRangesUsingStarts);
            allPossibleSelections.forEach((ranges, index) => {
                if (ranges.length !== selections.length) {
                    allPossibleSelections.delete(index);
                    return;
                }
                ranges.sort(range_1.Range.compareRangesUsingStarts);
                for (let i = 0; i < ranges.length; i++) {
                    if (!ranges[i].containsRange(selections[i])) {
                        allPossibleSelections.delete(index);
                        return;
                    }
                }
            });
            // from all possible selections we have deleted those
            // that don't match with the current selection. if we don't
            // have any left, we don't have a selection anymore
            return allPossibleSelections.size > 0;
        }
        getEnclosingRange() {
            let result;
            for (const snippet of this._snippets) {
                const snippetRange = snippet.getEnclosingRange();
                if (!result) {
                    result = snippetRange;
                }
                else {
                    result = result.plusRange(snippetRange);
                }
            }
            return result;
        }
    }
    exports.SnippetSession = SnippetSession;
});
//# sourceMappingURL=snippetSession.js.map