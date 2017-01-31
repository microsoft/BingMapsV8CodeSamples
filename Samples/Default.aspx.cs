using System;
using System.IO;
using System.Web.UI.WebControls;

namespace Samples
{
    public partial class Default : System.Web.UI.Page
    {
        private int NumberOfSamples = 0;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                NumberOfSamples = 0;

                DirectoryInfo directory = null;
                directory = new DirectoryInfo(Server.MapPath("~"));

                foreach (var dir in directory.GetDirectories())
                {
                    var categoryNode = new TreeNode(dir.Name)
                    {
                        SelectAction = TreeNodeSelectAction.Expand
                    };

                    var dirs = dir.GetDirectories();

                    if (dirs.Length > 0)
                    {
                        foreach (var d in dirs)
                        {
                            AddSampleNodes(dir, d, categoryNode);
                        }
                    }

                    AddSampleNodes(dir, null, categoryNode);

                    if (categoryNode.ChildNodes != null && categoryNode.ChildNodes.Count > 0)
                    {
                        SampleTreeView.Nodes.Add(categoryNode);
                    }
                }

                SampleCountLabel.Text = NumberOfSamples.ToString();
            }
        }

        private void AddSampleNodes(DirectoryInfo dir, DirectoryInfo dir2, TreeNode parentNode)
        {
            FileInfo[] files;

            if (dir2 == null)
            {
                files = dir.GetFiles("*.html");
            }
            else
            {
                files = dir2.GetFiles("*.html");
            }

            if (files.Length > 0)
            {
                string path, sourcePath;

                foreach (FileInfo fi in files)
                {
                    if (dir2 != null)
                    {
                        path = dir.Name + "/" + dir2.Name + "/" + fi.Name.ToString();
                        sourcePath = dir.Name + "/" + dir2.Name;
                    }
                    else
                    {
                        path = dir.Name + "/" + fi.Name.ToString();
                        sourcePath = path;
                    }

                    string name = fi.Name.Replace(".html", "");

                    var fileNode = new TreeNode(name)
                    {
                        SelectAction = TreeNodeSelectAction.SelectExpand,
                        NavigateUrl = string.Format("javascript:loadSample('{0}', '{1}', '{2}')", name, path, sourcePath)
                    };

                    parentNode.ChildNodes.Add(fileNode);

                    NumberOfSamples++;
                }
            }
        }
    }
}