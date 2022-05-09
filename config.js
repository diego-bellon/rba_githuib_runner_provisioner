const core = require('@actions/core');
const github = require('@actions/github');

class Config {
    constructor() {
        this.input = {
            mode: core.getInput('mode'),
            githubtoken: core.getInput('github-token'),
            runnerVersion: core.getInput('runnerVersion'),
            ec2ImageId: core.getInput('ec2-image-id'),
            ec2InstanceType: core.getInput('ec2-instance-type'),
            subnetId: core.getInput('subnet-id'),
            securityGroupId: core.getInput('security-group-id'),
            label: core.getInput('label'),
            ec2InstanceId: core.getInput('ec2-instance-id'),
            iamRoleName: core.getInput('iam-role-name'),
            runnerHomeDir: core.getInput('runner-home-dir'),
        };

        const tags = JSON.parse(core.getInput('aws-resource-tags'));
        this.tagSpecifications = null;
        if (tags.length > 0) {
            this.tagSpecifications = [{ResourceType: 'instance', Tags: tags}, {ResourceType: 'volume', Tags: tags}];
        }

        // the values of github.context.repo.owner and github.context.repo.repo are taken from
        // the environment variable GITHUB_REPOSITORY specified in "owner/repo" format and
        // provided by the GitHub Action on the runtime
        this.githubContext = {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        };

        //
        // validate input
        //

        if (!this.input.mode) {
            throw new Error(`The 'mode' input is not specified`);
        }
        if (this.input.mode === 'start') {
            if (!this.input.ec2ImageId || !this.input.ec2InstanceType || !this.input.subnetId || !this.input.securityGroupId) {
                throw new Error(`Not all the required inputs are provided for the 'start' mode`);
            }
        } else if (this.input.mode === 'stop') {
            if (!this.input.label || !this.input.ec2InstanceId) {
                throw new Error(`Not all the required inputs are provided for the 'stop' mode`);
            }
        } else if (this.input.mode === 'remove') {
            if (!this.input.label || !this.input.ec2InstanceId) {
                throw new Error(`Not all the required inputs are provided for the 'remove' mode`);
            }
        } else {
            throw new Error('Wrong mode. Allowed values: start, stop, remove.');
        }
    }

    generateUniqueLabel() {
        return Math.random().toString(36).substr(2, 5);
    }
}

try {
    module.exports = new Config();
} catch (error) {
    core.error(error);
    core.setFailed(error.message);
}
