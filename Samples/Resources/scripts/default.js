var githubProjectUrl = 'https://github.com/Microsoft/BingMapsV8CodeSamples/blob/master/Samples/';
var currentSampleElm;

function loadSample(name, path, sourcePath) {
    var sampleNode = getSampleNode(name);

    if (sampleNode) {
        if (currentSampleElm) {
            currentSampleElm.classList.remove('selectedNode');
        }

        currentSampleElm = sampleNode;
        currentSampleElm.classList.add('selectedNode');
    }
    
    window.location.hash = encodeURIComponent(name);
    document.getElementById('displayWindow').src = path;

    if (sourcePath && sourcePath != '') {
        document.getElementById('sourceCodeLinkPanel').style.display = '';
        document.getElementById('sourceCodeLink').href = githubProjectUrl + sourcePath;
    } else {
        document.getElementById('sourceCodeLinkPanel').style.display = 'none';
    }
    document.getElementById('displayWindow').focus();
}

var spaceRx = /\s/g;

function getSampleNode(name) {
    name = decodeURIComponent(name);

    var sampleLinks = document.getElementById('SampleTreeView').getElementsByTagName('a');

    for (var i = 0; i < sampleLinks.length; i++) {
        if (sampleLinks[i].innerText === name) {
            return sampleLinks[i];
        }
    }

    return null;
}

function getSamplesParent(sampleElm) {
    return sampleElm.parentNode.parentNode.parentNode.parentNode.parentNode.id;
}

window.onload = function () {
    if (warningMsg) {
        alert(warningMsg);
    }

    var hash = window.location.hash;

    if (hash) {
        hash = hash.replace('#', '');

        var sampleNode = getSampleNode(hash);

        if (sampleNode) {
            currentSampleElm = sampleNode;
            currentSampleElm.classList.add('selectedNode');

            window.location = sampleNode.href;

            var childNodesArg = getSamplesParent(sampleNode);
            var parentId = childNodesArg.replace('Nodes', '');
            var nodeIndex = parentId.charAt(parentId.length - 1);

            if (/[0-9]+/.test(nodeIndex)) {
                TreeView_ToggleNode(SampleTreeView_Data, nodeIndex, document.getElementById(parentId), ' ', document.getElementById(childNodesArg));
            }
        }
    }
}