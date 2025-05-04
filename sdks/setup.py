from setuptools import setup, find_packages

setup(
    name="script-editor-sdks",
    version="1.0.0",
    author="FallingShrimp",
    author_email="3161880837@qq.com",
    description="A script decompiler and player for ScriptEditor Project.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/Rundll86/script-editor-2",
    packages=find_packages(),
    install_requires=[],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
)
