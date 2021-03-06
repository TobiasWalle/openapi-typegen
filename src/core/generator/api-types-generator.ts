import { SourceFile } from 'ts-morph';
import { ApiPlan, InterfacePlan, PropertyPlan, TypePlanType } from '../type-plans';
import { createUnionTypePlanFromStrings, getDefinitionsImport, getTypeAsString } from '../type-plans/utils';
import { Generator } from '../types/generator';

const template = `
{{imports}}

export enum ParameterType {
    BODY = 'body',
    QUERY = 'query',
    FORM_DATA = 'formData',
    PATH = 'path',
}

export type ApiOperationIds = keyof ApiTypes;
`.trim();

export class ApiTypesGenerator extends Generator {
  public generate() {
    const imports = getDefinitionsImport(this.args.generationPlan.definitions);
    const initialSourceCode = template.replace('{{imports}}', imports);
    const sourceFile = this.setupFile('api-types.ts', initialSourceCode);
    this.addApiTypesInterface(sourceFile);
  }

  private addApiTypesInterface(sourceFile: SourceFile): void {
    const { generationPlan } = this.args;

    const apiTypesInterface = sourceFile.addInterface({ name: 'ApiTypes', isExported: true });
    Object.values(generationPlan.api)
      .forEach((apiPlan) => {
        const apiTypeInterface: InterfacePlan = {
          type: TypePlanType.INTERFACE,
          properties: this.generateApiTypeInterfacePlanProperties(apiPlan),
        };

        apiTypesInterface.addProperty({
          name: apiPlan.operationId,
          type: getTypeAsString(apiTypeInterface, sourceFile),
        });
      });
  }

  private generateApiTypeInterfacePlanProperties(apiPlan: ApiPlan): PropertyPlan[] {
    return [
      {
        name: 'tag', type: createUnionTypePlanFromStrings(apiPlan.tags), optional: false,
      },
      {
        name: 'parameters',
        type: apiPlan.parameters.type,
        optional: false,
      },
      {
        name: 'responses',
        type: {
          type: TypePlanType.INTERFACE,
          properties: [
            {
              name: 'success',
              type: apiPlan.responses.success,
              optional: false
            },
            {
              name: 'error',
              type: apiPlan.responses.error,
              optional: false
            },
          ],
        },
        optional: false,
      },
    ];
  }
}
