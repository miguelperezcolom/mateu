package io.mateu.mdd.annotationProcessing;

import com.sun.source.tree.BlockTree;
import com.sun.source.tree.ImportTree;
import com.sun.source.tree.PackageTree;
import com.sun.source.tree.VariableTree;
import com.sun.source.util.TreePathScanner;
import com.sun.source.util.Trees;

public class Visitante extends TreePathScanner<Object, Trees> {

    private String fieldName;

    private String fieldInitializer;

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldInitializer() {
        return this.fieldInitializer;
    }


    @Override
    public Object visitVariable(VariableTree variableTree, Trees trees) {
        if (variableTree.getName().toString().equals(this.fieldName)) {
            this.fieldInitializer = variableTree.getInitializer().toString();
        }

        return super.visitVariable(variableTree, trees);
    }

    @Override
    public Object visitBlock(BlockTree node, Trees trees) {
        return super.visitBlock(node, trees);
    }

    @Override
    public Object visitPackage(PackageTree node, Trees trees) {
        return super.visitPackage(node, trees);
    }

    @Override
    public Object visitImport(ImportTree node, Trees trees) {
        return super.visitImport(node, trees);
    }
}