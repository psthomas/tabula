import os
from string import Template


def update_hash():
	pass

def build_firefox():
	pass


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
		out.seek(0)
		out.write(html)
		out.truncate()


if __name__ == '__main__':
	# Uncomment as needed
	build_web()