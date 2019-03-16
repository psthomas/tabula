import os
from string import Template
from shutil import copyfile, copy
import subprocess

def update_hash():
    web_html_path = os.path.join(os.getcwd(), 
        'web', 'tabula.html')
    md_template_path = os.path.join(os.getcwd(), 
        'src', 'README-template.md')
    md_output_path = os.path.join(os.getcwd(), 'README.md')
    result = subprocess.run(args=['shasum', '-pa', '256', web_html_path], stdout=subprocess.PIPE)
    hash_str = result.stdout.decode('utf-8').split(' ')[0]

    with open(md_template_path, 'r') as md_template, open(md_output_path, 'w') as md_out:
        temp = Template(md_template.read())
        md = temp.safe_substitute({'hash': hash_str})
        md_out.write(md)

def build_firefox():
    cwd = os.getcwd()
    src_dir = os.path.join(cwd, 'src')
    js_dir =  os.path.join(src_dir, 'js')
    out_dir = os.path.join(cwd, 'firefox', 'popup')
    copy(os.path.join(js_dir, 'tabula.js'), out_dir)
    copy(os.path.join(js_dir, 'seedrandom.js'), out_dir)
    copy(os.path.join(js_dir, 'sjcl_build.js'), out_dir)
    # Note that this is the same file, no templating needed. 
    copyfile(os.path.join(src_dir, 'tabula-ff-template.html'), 
        os.path.join(out_dir, 'tabula-ff.html'))


def build_web():
    cwd = os.getcwd()
    src_dir = os.path.join(cwd, 'src')
    web_dir = os.path.join(cwd, 'web')
    template_path = os.path.join(src_dir, 'tabula-template.html')
    out_path = os.path.join(web_dir, 'tabula.html')
    js_dir =  os.path.join(src_dir, 'js')
    js_files = ['tabula', 'seedrandom', 'sjcl_build']
    sub_obj = {} 

    for js_file in js_files:
        js_path = os.path.join(js_dir, js_file + '.js')
        file_obj = open(js_path, 'r')
        sub_obj[js_file] = file_obj.read()
        file_obj.close()

    with open(template_path, 'r') as html_template, open(out_path, 'w') as out:
        temp = Template(html_template.read())
        # html = temp.safe_substitute(sub_obj)
        html = temp.substitute(sub_obj)
        # https://stackoverflow.com/questions/6648493
        # Don't need to seek, just write?
        #out.seek(0)
        out.write(html)
        #out.truncate()
    # Recalculate the hash
    update_hash()


if __name__ == '__main__':
    # Uncomment as needed
    build_web()
    build_firefox()
    # update_hash()