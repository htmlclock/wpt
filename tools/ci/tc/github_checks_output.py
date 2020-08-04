MYPY = False
if MYPY:
    # MYPY is set to True when run under Mypy.
    from typing import Any
    from typing import Dict
    from typing import Optional
    from typing import Text

class GitHubChecksOutputter(object):
    """Provides a method to output data to be shown in the GitHub Checks UI.

    This can be useful to provide a summary of a given check (e.g. the lint)
    to enable developers to quickly understand what has gone wrong. The output
    supports markdown format.

    See https://docs.taskcluster.net/docs/reference/integrations/github/checks#custom-text-output-in-checks
    """
    def __init__(self, path):
        # type: (Text) -> None
        self.path = path

    def output(self, line):
        # type: (Any) -> None
        with open(self.path, 'a') as f:
            f.write(line)
            f.write('\n')


__outputter = None
def get_gh_checks_outputter(kwargs):
    # type: (Dict[Text, Text]) -> Optional[GitHubChecksOutputter]
    """Return the outputter for GitHub Checks output, if enabled.

    :param kwargs: The arguments passed to the program (to look for the
                   --github_checks_text_file flag)
    """
    global __outputter
    if kwargs['github_checks_text_file'] and __outputter is None:
        __outputter = GitHubChecksOutputter(kwargs['github_checks_text_file'])
    return __outputter
