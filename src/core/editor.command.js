Emon.extendClass(EmonEditor, {
    _getCommand: function (name) {
        return this._commands[name.toLowerCase()];
    },

    _queryCommand: function (name, type, args) {
        var cmd = this._getCommand(name);
        if (cmd) {
            var queryCmd = cmd['query' + type];
            if (queryCmd)
                return queryCmd.apply(cmd, [this].concat(args));
        }
        return 0;
    },

    queryCommandState: function (name) {
        return this._queryCommand(name, "State", utils.argsToArray(1));
    },

    queryCommandValue: function (name) {
        return this._queryCommand(name, "Value", utils.argsToArray(1));
    },

    execCommand: function (name) {
        name = name.toLowerCase();

        var cmdArgs = utils.argsToArray(arguments, 1),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand(name);

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if (!cmd) {
            return false;
        }

        if (!this._hasEnterExecCommand && cmd.isNeedUndo()) {
            this._hasEnterExecCommand = true;
            stoped = this._fire(new EmonEvent('beforeExecCommand', eventParams, true));

            if (!stoped) {
                //保存场景
                this._fire(new EmonEvent('saveScene'));

                this._fire(new EmonEvent("preExecCommand", eventParams, false));

                result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

                this._fire(new EmonEvent('execCommand', eventParams, false));

                //保存场景
                this._fire(new EmonEvent('saveScene'));

                if (cmd.isContentChanged()) {
                    this._firePharse(new EmonEvent('contentchange'));
                }
                if (cmd.isSelectionChanged()) {
                    this._firePharse(new EmonEvent('selectionchange'));
                }
                this._firePharse(new EmonEvent('interactchange'));
            }
            this._hasEnterExecCommand = false;
        } else {
            result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

            if (!this._hasEnterExecCommand) {
                if (cmd.isSelectionChanged()) {
                    this._firePharse(new EmonEvent('selectionchange'));
                }

                this._firePharse(new EmonEvent('interactchange'));
            }
        }

        return result === undefined ? null : result;
    }
});